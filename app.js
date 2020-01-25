var express = require('express')
var path = require('path')
var favicon = require('static-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

// These are the new imports we're adding:
var passport = require('passport')
var Strategy = require('passport-local').Strategy
var db = require('./db')
var session = require('express-session')
var flash = require('connect-flash')

var index_routes = require('./routes/index')
var auth_routes = require('./routes/auth')
var import_routes = require('./routes/import')
var user_routes = require('./routes/users')
var result_routes = require('./routes/results')
var admin_routes = require('./routes/admin')

var app = express()
app.locals.moment = require('moment')

// var strategy = new StormpathStrategy({expansions: 'groups,groupMemberships'});
// passport.use(strategy);
// passport.serializeUser(strategy.serializeUser);
// passport.deserializeUser(strategy.deserializeUser);

passport.use(new Strategy(
  function(username, password, cb) {
    console.log('FIND USERNAME')
    console.log(username)

    var query = {
      selector: { username: username }
    }

    db.people.find(query, function(err, result) {
      console.log(err)
      console.log(result)

      if (err) { return cb(err) }
      var doc = result.docs[0]

      console.log(doc)

      if (doc.password != password) { return cb(null, false) }

      var user = {
        id: doc._id,
        username: doc.username,
        displayName: doc.displayName
      }
      return cb(null, user)
    })

    /*
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
    */
  }))

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id)
})

passport.deserializeUser(function(id, cb) {
  db.people.get(id, function(err, doc) {
    // TODO: handle 'not_found' error
    if (err) { return cb(err) }

    var user = {
      id: doc._id,
      username: doc.username,
      displayName: doc.displayName
    }
    return cb(null, user)
  })

  /*
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
  */
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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

app.use('/', index_routes)
app.use('/', auth_routes)
app.use('/import', import_routes)
app.use('/users', user_routes)
app.use('/results', result_routes)
app.use('/admin', admin_routes)

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
