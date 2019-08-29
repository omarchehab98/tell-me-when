const fs = require('fs')
const path = require('path')
const environment = require('./environment.js')
const scrapeIt = require('scrape-it')
const Runner = require('./Runner.js')
const Mail = require('./Mail.js')
// const TorClient = require('./TorClient.js')
const LocalClient = require('./LocalClient.js')

// const client = new TorClient(environment.tor)
const client = new LocalClient()
const mail = new Mail(environment.nodemailer)

const heartbeatDataDefault = () => ({
  start: Date.now(),
  notOkStatusCount: 0,
  notOkStatusMap: {},
  webpageChangedCount: 0,
  failedScrapeCount: 0,
  successfulScrapeCount: 0,
  notifiedCourses: [],
  unhandledErrors: [],
})
const heartbeatDataProccessed = (heartbeatData) => ({
  lastHeartbeat: new Date(heartbeatData.start).toUTCString(),
  elapsedSinceLastHeartbeat: (Date.now() - heartbeatData.start) + 'ms',
  ...heartbeatData,
})

let previousHeartbeat
try {
  previousHeartbeat = require('./heartbeat.json')
} catch (e) {
  previousHeartbeat = null
}
let heartbeatData = {
  ...heartbeatDataDefault(),
  ...previousHeartbeat,
}

async function heartbeat() {
  const heartbeatDataString = JSON.stringify(
    heartbeatDataProccessed(heartbeatData),
    null,
    2
  )
  heartbeatData = heartbeatDataDefault()
  
  console.log('[Debug] Heartbeat', heartbeatDataString)

  const text = heartbeatDataString
  const html = '<code>'
    + heartbeatDataString
      .replace(/\n/g, '<br>')
      .replace(/\s/g, '&nbsp;')
    + '</code>'

  await Promise.all(
    environment.heartbeatEmails.map((to) => mail.send({
      to,
      subject: `Tell Me When Heartbeat`,
      text,
      html,
    }))
  )

  await saveHeartbeatToFile()
}

function saveHeartbeatToFile() {
  const heartbeatDataString = JSON.stringify(
    heartbeatDataProccessed(heartbeatData),
    null,
    2
  )
  fs.writeFileSync(path.join(__dirname, './heartbeat.json'), heartbeatDataString, 'utf8')
}

heartbeat()
setInterval(heartbeat, environment.heartbeatFrequency)

const runnerOffset = environment.pollFrequency / environment.watchCourses.length

environment.watchCourses.forEach(async ({ termId, courseId }, i) => {
  const runner = new Runner(timedScrapeTask, environment.pollFrequency)

  await sleep(i * runnerOffset)

  runner.start()

  async function timedScrapeTask(...args) {
    const start = Date.now()
    await scrapeTask(...args)
    const end = Date.now()
    const ms = end - start
  }

  async function scrapeTask() {
    try {
      const response = await client.request(
        `https://www-banner.aub.edu.lb/pls/weba/bwckschd.p_disp_detail_sched?term_in=${termId}&crn_in=${courseId}`
      )

      if (response.statusCode !== 200) {
        console.error('[Exception] HTTP Server returned `statusCode`.', response.statusCode)
        heartbeatData.notOkStatusCount += 1
        heartbeatData.notOkStatusMap[response.statusCode] += 1
        await saveHeartbeatToFile()
        return
      }

      const page = await scrapeIt.scrapeHTML(response.body, {
        availability: 'table table tr:nth-child(3) td:last-child'
      })
      
      const availability = parseInt(page.availability, 10)

      if (isNaN(availability)) {
        console.error('[Exception] Webpage has changed, could not scrape `availability`.')
        heartbeatData.webpageChangedCount += 1
        await saveHeartbeatToFile()
        return
      }
      
      if (availability > 0) {
        const prettyDate = new Date().toUTCString()
        const text = `[Success] As of ${prettyDate} the section ${courseId} running during the term ${termId} has ${availability} vacancies. Grab it while you can :)`
        console.log(text)

        await Promise.all([
          environment.notifyEmails.map((to) => mail.send({
            to,
            subject: `Course ${courseId} Term ${termId} has seats!`,
            text,
            html: `<p>${text}</p>`,
          }))
        ])

        heartbeatData.notifiedCourses.push(courseId)
        
        runner.stop()
        await saveHeartbeatToFile()
        return
      }

      heartbeatData.successfulScrapeCount += 1
      await saveHeartbeatToFile()
    } catch (err) {
      switch (err.code || err.message) {
        case 'ETIMEDOUT':
        case 'ECONNRESET':
        case 'Connection Timed Out':
          client.newSession()
          heartbeatData.failedScrapeCount += 1
          await saveHeartbeatToFile()
          return;
        
        default:
          console.error('[Unhandled Error]', err)
          heartbeatData.unhandledErrors.push(err)
          await saveHeartbeatToFile()
          return;
      }
    }
  }
})

function sleep(wait) {
  return new Promise((resolve) => {
    setTimeout(resolve, wait)
  })
}
