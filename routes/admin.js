var express = require('express')
var router = express.Router()
var dynamoFuncs = require('../lib/dynamo')
var _ = require('underscore')
// Render the home page.
router.get('/', function(req, res) {

  if (!req.user || req.user.status !== 'ENABLED') {
    return res.redirect('/login')
  }

  console.log(JSON.stringify(req.user, null, 2))

})

router.get('/createtagstable', function(req, res) {
  console.log('CF Route')
  if (!req.user || req.user.status !== 'ENABLED') {
    console.log('Auth Failure')
    return res.redirect('/login')
  }

  dynamoFuncs.createTimeTagTable(function(err) {

    if (err) {
      res.send(JSON.stringify(
        {
          code: 'error',
          error: err
        }))
    } else {
      res.send(JSON.stringify(
        {
          code: 'complete'
        }))
    }

  })

})

router.get('/createrunnerstable', function(req, res) {
  console.log('Runners Route')
  if (!req.user || req.user.status !== 'ENABLED') {
    console.log('Auth Failure')
    return res.redirect('/login')
  }

  dynamoFuncs.createStudentsTable(function(err) {

    if (err) {
      res.send(JSON.stringify(
        {
          code: 'error',
          error: err
        }))
    } else {
      res.send(JSON.stringify(
        {
          code: 'complete'
        }))
    }

  })

})

router.get('/deletetagstable', function(req, res) {
  console.log('CF Route')
  if (!req.user || req.user.status !== 'ENABLED') {
    console.log('Auth Failure')
    return res.redirect('/login')
  }

  dynamoFuncs.deleteTable(dynamoFuncs.TimeTagTable, function(err) {

    if (err) {
      res.send(JSON.stringify(
        {
          code: 'error',
          error: err
        }))
    } else {
      res.send(JSON.stringify(
        {
          code: 'complete'
        }))
    }

  })

})

router.get('/deleterunnerstable', function(req, res) {
  console.log('Runners Route')
  if (!req.user || req.user.status !== 'ENABLED') {
    console.log('Auth Failure')
    return res.redirect('/login')
  }

  dynamoFuncs.deleteTable(dynamoFuncs.StudentsTableName, function(err) {

    if (err) {
      res.send(JSON.stringify(
        {
          code: 'error',
          error: err
        }))
    } else {
      res.send(JSON.stringify(
        {
          code: 'complete'
        }))
    }

  })

})

router.get('/createfake', function(req, res) {
  console.log('CF Route')
  if (!req.user || req.user.status !== 'ENABLED') {
    return res.redirect('/login')
  }
})

module.exports = router
