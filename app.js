const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const fs = require('fs')
global.__basedir = __dirname

// These are the new imports we're adding:
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const session = require('express-session')
const flash = require('connect-flash')

const index_routes = require('./routes/index')
const import_routes = require('./routes/import')
const user_routes = require('./routes/users')
const result_routes = require('./routes/results')
const admin_routes = require('./routes/admin')
const race_routes = require('./routes/api/races')
const runner_routes = require('./routes/api/runner')
const checkin_routes = require('./routes/api/checkin')
const races_routes = require('./routes/races')
const runners_routes = require('./routes/runners')
const filePath = path.join(__dirname, 'public/files')
const images = path.join(filePath, 'images')
const pdfs = path.join(filePath, 'pdfs')

if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath)
}

if (!fs.existsSync(images)) {
  fs.mkdirSync(images)
}

if (!fs.existsSync(pdfs)) {
  fs.mkdirSync(pdfs)
}
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })

const app = express()
app.locals.moment = require('moment')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(require('stylus')
  .middleware(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: process.env.EXPRESS_SECRET,
  key: 'sid',
  cookie: { secure: false }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

const Account = require('./models/UserAccount')
passport.use(new Strategy(Account.authenticate()))

passport.serializeUser(Account.serializeUser())
passport.deserializeUser(Account.deserializeUser())

app.use('/', index_routes)
app.use('/import', import_routes)
app.use('/users', user_routes)
app.use('/results', result_routes)
app.use('/admin', admin_routes)
app.use('/api/races', race_routes)
app.use('/api/runners', runner_routes)
app.use('/api/checkin', checkin_routes)
app.use('/races', races_routes)
app.use('/runners', runners_routes)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
