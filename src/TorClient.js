/**
 * @param {object} credentials
 * @param {string} credentials.controlPassword raw password
 */
function TorClient(credentials) {
  this.tor = require('tor-request')
  this.tor.TorControlPort.password = credentials.controlPassword
  this.requestCounter = 0
  this.newSessionInterval = 10
  this.newSessionPromise = false
}

/**
 * Performs a HTTP Request through Tor.
 * 
 * @param {string|object} options see `request` package
 * @returns {Promise}
 */
TorClient.prototype.request = function(options) {
  return new Promise(async (resolve, reject) => {
    if (this.newSessionPromise) {
      await this.newSessionPromise
    }

    this.requestCounter += 1

    if (this.requestCounter % this.newSessionInterval == 0) {
      await this.newSession()
    }
    
    this.tor.request(options, (err, response) => {
      if (err) {
        reject(err)
        return
      }
      resolve(response)
    })
  })
}

/**
 * Creates a new Tor session, changing the client's IP address.
 * 
 * @returns {Promise}
 */
TorClient.prototype.newSession = function() {
  if (this.newSessionPromise) {
    return
  }
  this.newSessionPromise = new Promise((resolve, reject) => {
    this.tor.newTorSession((err) => {
      this.newSessionPromise = false
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
  return this.newSessionPromise
}

module.exports = TorClient
