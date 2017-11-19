/**
 * @param {Function} task must return a promise
 * @param {number} interval milliseconds
 */
function Runner(task, interval) {
  this.task = task
  this.interval = interval
  this.taskIsFinished = true
  this.runTask = this.runTask.bind(this)
}

/**
 * Starts the runner.
 * 
 * Restarts the runner if it is already runner.
 */
Runner.prototype.start = function start() {
  this.stop();
  this.intervalId = setInterval(this.runTask, this.interval)
}

/**
 * Runs the task with the last task's result as the parameter.
 * 
 * If the previous task is not finished, then the task is not run.
 * @returns {Promise}
 */
Runner.prototype.runTask = function runTask() {
  if (!this.taskIsFinished) {
    return
  }
  this.taskIsFinished = false
  return new Promise((resolve, reject) => {
    this.task(this.lastResult)
      .then((result) => {
        this.lastResult = result
        this.taskIsFinished = true
        resolve(result)
      })
      .catch(reject)
  })
}

/**
 * Stops the runner.
 */
Runner.prototype.stop = function stop() {
  clearInterval(this.intervalId)
}

module.exports = Runner
