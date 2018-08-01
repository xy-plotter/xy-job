export default {
  WRONG_INSTRUCTION: (name) => `Job instruction ${name} is invalid.`,
  JOB_ENDED: (name) => `Job already ended. Can't enqueue ${name} instruction.`,
  OUT_OF_BOUNDS: (x, y) => `Move to to out-of-bounds coordinates: ${x};${y}.`,
  WRONG_SPEED: () => `Speed value must be between 0 and 1. Leaving speed setting unchanged.`
}
