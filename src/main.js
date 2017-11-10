const environment = require('./environment.js')

function createRunner(task, interval) {
  const Runner = require('./Runner.js')
  return new Runner(task, interval)
}

function createMail(credentials) {
  const Mail = require('./Mail.js')
  return new Mail(credentials)
}

const runner = createRunner(async function (counter) {
  await sleep(250)
  console.log(counter)
  return counter + 1
}, 500)

runner.start()

function sleep(timeout) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timeout)
  })
}

// const mail = createMail(environment.nodemailer)
// mail.send({
//   from: 'Tell Me When <tellmewhen.notification@gmail.com>',
//   to: '2k435jsdahn6jkh@mailinator.com',
//   subject: 'Hello World',
//   text: 'Hello world!',
//   html: '<p>Hello world</p>'
// })
//   .then(console.log)
//   .catch(console.error)
