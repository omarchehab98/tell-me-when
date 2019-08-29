const request = require('request')

/**
 */
function LocalClient() {
}

/**
 * Performs a HTTP Request using the local network.
 * 
 * @param {string|object} options see `request` package
 * @returns {Promise}
 */
LocalClient.prototype.request = function(options) {
  return new Promise(async (resolve, reject) => {
    request(options, (err, response) => {
      if (err) {
        reject(err)
        return
      }
      resolve(response)
    })
  })
}

module.exports = LocalClient
