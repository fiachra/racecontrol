var express = require('express')
var router = express.Router()
var passport = require('passport')
var db = require('../db')

// Render the registration page.
router.get('/register', function(req, res) {
  if (!req.user || req.user.status !== 'ENABLED') {
    return res.redirect('/login')
  }

  res.render('register',
    {
      title: 'Register',
      error: req.flash('error')[0]
    })
})

// Register a new user to Stormpath.
router.post('/register', function(req, res) {
  // if (!req.user || req.user.status !== 'ENABLED')
  // {
  //     return res.redirect('/login');
  // }

  var username = req.body.username
  var password = req.body.password

  // Grab user fields.
  if (!username || !password) {
    return res.render('register',
      {
        title: 'Register',
        error: 'Email and password required.'
      })
  }

  console.log('REGISTER!')
  console.log(req.body)

  var user = {
    displayName: req.body.name,
    username: req.body.username,
    password: req.body.password
  }

  // FIXME: rename to users
  // use post to auto-assign an _id
  db.people.post(user, function callback(err, result) {
    console.log(err)
    console.log(result)

  })
})

// Render the login page.
router.get('/login', function(req, res) {
  res.render('login',
    {
      title: 'Login',
      error: req.flash('error')[0]
    })
})

// Authenticate a user.
router.post('/login', passport.authenticate('local',
  {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: 'Invalid email or password.'
  }))

// Logout the user, then redirect to the home page.
router.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/')
})

module.exports = router
