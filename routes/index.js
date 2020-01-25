var express = require('express')
var router = express.Router()
var dynamoFuncs = require('../lib/dynamo')
var studentInfo = require('../lib/studentInfoHolder')

// Render the home page.
router.get('/', function(req, res) {
  res.render('index',
    {
      title: 'Home',
      user: req.user
    })
})

// Render the dashboard page.
router.get('/dashboard', function(req, res) {

  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }

  studentInfo.initilize(function(err) {
    console.log(err)
    res.render('dashboard',
      {
        title: 'Dashboard',
        user: req.user
      })

  })

})

// Render the dashboard page.
router.get('/scan', function(req, res) {

  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login')
  // }

  res.render('scan',
    {
      title: 'Scan',
      user: req.user
    })

})

router.get('/test', function(req, res) {
  res.render('test',
    {
      title: 'Dashboard',
      user: req.user
    })

})

module.exports = router
