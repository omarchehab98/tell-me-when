/**
 * @param {Function} task must return a promise
 * @param {number} interval milliseconds
 */
function Runner(task, interval) {
  this.task = task
  this.interval = interval
  this.taskIsFinished = true
}

Runner.prototype.start = function start() {
  this.intervalId = setInterval(this.runTask, this.interval)
}

Runner.prototype.runTask = function runTask() {
  if (!this.taskIsFinished) {
    return
  }
  this.taskIsFinished = false
  this.task(this.lastResult)
    .then((result) => {
      this.lastResult = result
      this.taskIsFinished = true
      resolve(result)
    })
    // .catch(reject)
}

Runner.prototype.stop = function stop() {
  clearInterval(this.intervalId)
}

module.exports = Runner
