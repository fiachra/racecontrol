let mongoose = require('mongoose')

const Runner = mongoose.Schema({
  name: String,
  class: String
})

module.exports = mongoose.model('Runner', Runner)