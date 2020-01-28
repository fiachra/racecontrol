
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserAccount = new Schema({
  nickname: String,
  birthdate: Date,
  role: String
})

UserAccount.plugin(passportLocalMongoose)

module.exports = mongoose.model('UserAccount', UserAccount)