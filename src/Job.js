import Emitter from 'tiny-emitter'
import Logger from './utils/Logger'
import getJobName from './utils/getJobName'

import rounder from './utils/rounder'
import api from './models/api'
import msg from './models/messages'

const DEFAULTS = {
  name: '',
  canvasWidth: 380,
  canvasHeight: 310,
  penUp: 0,
  penDown: 30,
  precision: 3
}

// Milliseconds
const SPEED_MAX_DELAY = 1000
const SPEED_MIN_DELAY = 100

export default class Job extends Emitter {
  constructor (opts = {}) {
    super()

    // Set options
    opts = Object.assign({}, DEFAULTS, opts)
    this.name = getJobName(opts.name)
    this.round = rounder(opts.precision | 0)
    this.bounds = {
      canvas: [this.round(opts.canvasWidth), this.round(opts.canvasHeight)],
      pen: [this.round(opts.penUp), this.round(opts.penDown)]
    }

    // Log utils
    this.logger = new Logger({ job: this.name })
    this.warn = this.logger.warn.bind(this.logger)

    // Queue and its State. Only mutate state in enqueue.
    this.queue = []
    this.queueState = {
      ended: false,
      x: 0,
      y: 0,
      pen: this.bounds.pen[0],
      speed: 'auto'
    }

    this.reset()
  }

  canEnqueue (method) {
    // 'return fn() && false' => quick way to call fn and always return false
    if (this.queueState.ended) return this.warn(msg.JOB_ENDED(method)) && false
    if (method && !api[method]) return this.warn(msg.WRONG_INSTRUCTION(method)) && false
    return true
  }

  enqueue (task, a0, a1) {
    if (!this.canEnqueue(task)) return this

    // Do rounding on all number here
    // Don't do operations on number after to avoid floating point issues
    if (!isNaN(a0)) a0 = this.round(a0)
    if (!isNaN(a1)) a1 = this.round(a1)

    // Only place where the state needs to be mutate
    if (task === 'MOVE') {
      this.queueState.x = a0
      this.queueState.y = a1
    } else if (task === 'PEN') {
      this.queueState.pen = a0
    } else if (task === 'END') {
      this.queueState.ended = true
    } else if (task === 'SPEED_RESET') {
      this.queueState.speed = 'auto'
    } else if (task === 'SPEED') {
      this.queueState.speed = a0
    }

    this.queue.push(api[task](a0, a1))
    return this
  }

  reset () {
    // Directly test if it's possible to add instruction
    // to avoid multiple errors due to chaining them
    if (!this.canEnqueue('HOME')) return this
    this.penUp(true)
    this.resetSpeed()
    this.queueState.x = 0
    this.queueState.y = 0
    return this.enqueue('HOME')
  }

  pen (ang) {
    // Don't add instruction if the value is the same as the saved one
    if (this.queueState.pen !== this.round(ang)) return this
    return this.enqueue('PEN', ang)
  }

  penUp () {
    return this.pen(this.bounds.pen[0])
  }

  penDown () {
    return this.pen(this.bounds.pen[1])
  }

  setSpeed (speedPercent) {
    if (speedPercent === undefined || speedPercent === 'auto' || isNaN(speedPercent)) {
      return this.resetSpeed()
    }

    if (speedPercent < 0 || speedPercent > 1) {
      this.warn(msg.WRONG_SPEED())
      return this
    }

    const speed = SPEED_MIN_DELAY + SPEED_MAX_DELAY - (SPEED_MAX_DELAY * speedPercent)

    // Don't add instruction if the value is the same as the saved one
    if (this.queueState.speed !== this.round(speed)) this.enqueue('SPEED', speed)
    return this
  }

  resetSpeed () {
    // Don't add instruction if the value is the same as the saved one
    if (this.queueState.speed !== 'auto') this.enqueue('SPEED_RESET')
    return this
  }

  move (x, y) {
    if (!this.canEnqueue('MOVE')) return this
    if (x < 0 || x > this.bounds.canvas[0] || y < 0 || y > this.bounds.canvas[1]) {
      this.warn(msg.OUT_OF_BOUNDS(x, y))
    }

    // The plotter can't go from 0 to 380 in one move (???)
    // Subdivide long moves as a dirty fix for this
    // @TODO: Identify the 0-to-380 issue (maybe on the firmware side)
    const limit = 300 / 2
    const relMove = [x - this.queueState.x, y - this.queueState.y]
    const div = Math.max(Math.max(relMove[0], relMove[1]) / limit, 1)
    const step = [this.round(relMove[0] / div), this.round(relMove[1] / div)]
    while (Math.abs(relMove[0]) > limit || Math.abs(relMove[1]) > limit) {
      relMove[0] -= step[0]
      relMove[1] -= step[1]
      this.enqueue('MOVE', this.queueState.x + step[0], this.queueState.y + step[1])
    }

    // Don't add instruction if the value is the same as the saved one
    if (this.queueState.x !== this.round(x) || this.queueState.y !== this.round(y)) {
      this.enqueue('MOVE', x, y)
    }
    return this
  }

  wait (msg, code) {
    return this.enqueue('WAIT', msg, code)
  }

  end () {
    return this.enqueue('END')
  }
}
