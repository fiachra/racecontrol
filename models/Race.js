
let mongoose = require('mongoose')

const Race = mongoose.Schema({
  name: String,
  startTime: Date,
  length: Number,
  created: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Race', Race)