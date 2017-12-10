/**
 * @param {object} credentials see nodemailer #createTransport
 */
function Mail(credentials) {
  const nodemailer = require('nodemailer')
  this.transporter = nodemailer.createTransport(credentials)
  this.defaultOptions = credentials.defaultOptions
}

/**
 * @param {object} options see nodemailer #sendMail
 * @returns {Promise}
 */
Mail.prototype.send = function send(options) {
  return new Promise((resolve, reject) => {
    this.transporter.sendMail({
      ...this.defaultOptions,
      ...options,
    }, (error, info) => {
      if (error) {
        reject(error)
        return
      }
      resolve(info)
    })
  })
}

module.exports = Mail
