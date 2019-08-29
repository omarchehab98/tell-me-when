const tor = require('tor-request')

/**
 * @param {object} credentials
 * @param {string} credentials.controlPassword raw password
 */
function TorClient(credentials) {
  tor.TorControlPort.password = credentials.controlPassword
  this.requestCounter = 0
  this.newSessionInterval = 100
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
    
    tor.request(options, (err, response) => {
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
  this.requestCounter = 0
  this.newSessionPromise = new Promise((resolve, reject) => {
    tor.newTorSession((err) => {
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
