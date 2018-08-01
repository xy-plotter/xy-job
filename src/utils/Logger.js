import isBrowser from './isBrowser'

const TAGS = {
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39]
}

const COLORS = {}

if (!isBrowser) {
  for (let color in TAGS) {
    const openTag = '\u001b[' + TAGS[color][0] + 'm'
    const closeTag = '\u001b[' + TAGS[color][1] + 'm'
    COLORS[color] = s => console.log(openTag + s + closeTag)
  }
}

const info = console.log
const success = isBrowser ? console.log : COLORS.green
const warn = isBrowser ? console.warn : COLORS.yellow
const error = isBrowser ? console.error : COLORS.error
const msg = (msg, p, s, fn) => fn(p + ' ' + msg + ' ' + s)

export default class Logger {
  constructor (opts = {}) {
    this.prefix = '[xy-job]'
    this.suffix = '(job: ' + opts.job + ')' || ''
  }
  info (m) { return msg(m, this.prefix, this.suffix, info) }
  warn (m) { return msg(m, this.prefix + ' Warning:', this.suffix, warn) }
  error (m) { return msg(m, this.prefix + ' Error:', this.suffix, error) }
  success (m) { return msg(m, this.prefix + ' Success:', this.suffix, success) }
}
