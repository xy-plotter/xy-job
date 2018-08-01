const Job = require('../dist/xy-job')
const job = new Job({ name: 'Test' })

job.setSpeed(10)
job.move(100, 100)
