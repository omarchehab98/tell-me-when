/**
 * @param {object} credentials see nodemailer #createTransport
 */
function Mail(credentials) {
  const nodemailer = require('nodemailer')
  this.transporter = nodemailer.createTransport(credentials)
}

/**
 * @param {object} options see nodemailer #sendMail
 */
Mail.prototype.send = function send(options) {
  return new Promise((resolve, reject) => {
    this.transporter.sendMail(options, (error, info) => {
      if (error) {
        reject(error)
        return
      }
      resolve(info)
    })
  })
}

module.exports = Mail
