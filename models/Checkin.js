let mongoose = require('mongoose')

const Checkin = mongoose.Schema({
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race' },
  runner: { type: mongoose.Schema.Types.ObjectId, ref: 'Runner' },
  time: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Checkin', Checkin)
