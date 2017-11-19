const environment = require('./environment.js')
const scrapeIt = require('scrape-it')
const Runner = require('./Runner.js')
const Mail = require('./Mail.js')
const TorClient = require('./TorClient.js')

const torClient = new TorClient(environment.tor)
const mail = new Mail(environment.nodemailer)

const courseIds = [
  21967,
  21971,
  21976,
  21985,
  20814,
  22057,
]

const pollFrequency = 60 * 1000
const runnerOffset = pollFrequency / courseIds.length

courseIds.forEach(async (courseId, i) => {
  const runner = new Runner(scrapeTask, pollFrequency)

  await sleep(i * runnerOffset)

  runner.start()

  async function scrapeTask() {
    try {
      const response = await torClient.request(
        `https://www-banner.aub.edu.lb/pls/weba/bwckschd.p_disp_detail_sched?term_in=201820&crn_in=${courseId}`
      )

      if (response.statusCode !== 200) {
        console.error('[Error] HTTP Server returned `statusCode`.', response.statusCode)
        return
      }

      const page = await scrapeIt.scrapeHTML(response.body, {
        availability: 'table table tr:nth-child(3) td:last-child'
      })
      
      const availability = parseInt(page.availability, 10)

      if (isNaN(availability)) {
        console.error('[Error] Webpage has changed, could not scrape `availability`.')
        return
      }
      
      if (availability > 0) {
        const prettyDate = new Date().toUTCString()
        const message = `[Success] As of ${prettyDate} the course ${courseId} has ${availability} vacancies. Grab it while you can :)`
        console.log(message)
        await mail.send({
          from: 'Tell Me When <tellmewhen.notification@gmail.com>',
          to: 'wga06@mail.aub.edu',
          subject: `Course ${courseId} has seats!`,
          text: message,
          html: `<p>${message}</p>`,
        })
        await mail.send({
          from: 'Tell Me When <tellmewhen.notification@gmail.com>',
          to: 'omarchehab98@gmail.com',
          subject: `Course ${courseId} has seats!`,
          text: message,
          html: `<p>${message}</p>`,
        })
        runner.stop()
      }
    } catch (err) {
      if (err.message === 'Connection Timed Out') {
        torClient.newSession()
      } else {
        console.error('[Error]', err)
      }
    }
  }
})

function sleep(wait) {
  return new Promise((resolve) => {
    setTimeout(resolve, wait)
  })
}
