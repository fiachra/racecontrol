
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserAccount = new Schema({
  name: String,
  role: String
})

UserAccount.plugin(passportLocalMongoose)

module.exports = mongoose.model('UserAccount', UserAccount)