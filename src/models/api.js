export default {
  HOME: () => ['HOME'],
  MOVE: (x = 0, y = 0) => ['MOVE', +x, +y],
  PEN: (ang = 0) => ['PEN', ang],
  SPEED: (amount = 0) => ['SPEED', +amount],
  SPEED_RESET: () => ['SPEED_RESET'],
  WAIT: (msg = '', code = '') => ['WAIT', msg + '', code + ''],
  END: () => ['END']
}
