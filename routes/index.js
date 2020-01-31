const express = require('express')
const router = express.Router()
const passport = require('passport')
const moment = require('moment')
const Account = require('../models/UserAccount')
const Race = require('../models/Race')
const Runner = require('../models/Runner')
const Checkin = require('../models/Checkin')

router.get('/', function(req, res) {
  res.render('index',
    {
      title: 'Home',
      user: req.user
    })
})

router.get('/test', function(req, res) {
  res.render('test',
    {
      title: 'Test',
      user: req.user
    })
})

router.get('/scan', function(req, res) {

  if (!req.user) {
    return res.redirect('/login')
  }

  res.render('scan',
    {
      title: 'Scan',
      user: req.user
    })

})

// Auth routes

// Render the registration page.
router.get('/register', function(req, res) {
  if (!req.user || req.user.role !== 'admin') {
    return res.redirect('/')
  }

  res.render('register',
    {
      title: 'Register',
      error: req.flash('error')[0]
    })
})

router.post('/register', function(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.redirect('/')
  }

  console.log('registering user')
  Account.register(new Account({ username: req.body.username, role: 'user' }), req.body.password, function(err) {
    if (err) {
      console.log('error while user register!', err)
      return next(err)
    }

    console.log('user registered!')

    res.redirect('/login')
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
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: 'Invalid email or password.'
  }))

// Logout the user, then redirect to the home page.
router.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/')
})

// checkin route
router.get('/checkin/race/:raceId/runner/:runnerId', async(req, res) => {

  if (!req.user) {
    return res.status(500).send({ error: 'Not logged in' })
  }

  let race = await Race.findById(req.params.raceId)
  let runner = await Runner.findById(req.params.runnerId)

  if (race && runner) {
    try {
      let checkin = await Checkin.create({ race: race._id, scanner: req.user.name, runner: runner._id })
      let ch = await Checkin.find()

      runner.time = moment(checkin.time).format('LTS')
      let ret = {
        name: runner.name,
        time: moment(checkin.time).format('LTS'),
        extra: {
          checkin,
          ch
        }
      }

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(ret))
    } catch (err) {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(err))
    }
  }
})

module.exports = router
