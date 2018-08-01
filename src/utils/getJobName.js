const PREFIX = 'job'
const SEP = ''
const BIGSEP = '_'

const pad = v => +v < 10 ? '0' + v : '' + v

function defaultName () {
  const d = new Date()
  const year = d.getFullYear()
  const month = pad(d.getMonth())
  const day = pad(d.getDate())
  const hour = pad(d.getHours())
  const min = pad(d.getMinutes())
  const sec = pad(d.getSeconds())
  const millis = d.getMilliseconds()
  const rand = Math.floor(Math.random() * 999999)

  let t = ''
  t += PREFIX + BIGSEP
  t += year + SEP + month + SEP + day
  t += BIGSEP
  t += hour + SEP + min + SEP + sec
  t += BIGSEP
  t += millis
  t += BIGSEP
  t += rand
  return t
}

export default function getJobName (name) {
  return (name.length > 1) ? name : defaultName()
}
