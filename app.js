var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
 
// These are the new imports we're adding:
var passport = require('passport');
var StormpathStrategy = require('passport-stormpath');
var session = require('express-session');
var flash = require('connect-flash');

var index_routes = require('./routes/index');
var auth_routes = require('./routes/auth');
var import_routes = require('./routes/import');
var user_routes = require('./routes/users');
var result_routes = require('./routes/results');
var admin_routes = require('./routes/admin');

var app = express();
app.locals.moment = require('moment');

var strategy = new StormpathStrategy({expansions: 'groups,groupMemberships'});
passport.use(strategy);
passport.serializeUser(strategy.serializeUser);
passport.deserializeUser(strategy.deserializeUser);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.EXPRESS_SECRET,
  key: 'sid',
  cookie: { secure: false },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', index_routes);
app.use('/', auth_routes);
app.use('/import', import_routes);
app.use('/users', user_routes);
app.use('/results',result_routes);
app.use('/admin',admin_routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
