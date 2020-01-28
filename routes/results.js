var express = require('express')
var router = express.Router()
var dynamoFuncs = require('../lib/dynamo')
var studentInfo = require('../lib/studentInfoHolder')
var _ = require('underscore')
var runnerInfo = require('../lib/RunnerInfo')

// Render the home page.
router.get('/', async(req, res) => {

  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }

  let raceId = '5e2d7c675fa14339bf1b8ba0'

  await runnerInfo.updateForRaceID(raceId)

  var completed = runnerInfo.runners.filter(v => v.status === 'Complete')
  var inProgress = runnerInfo.runners.filter(v => v.status === 'Running')
  var notStarted = runnerInfo.runners.filter(v => v.status === 'Not Started')
  var errors = runnerInfo.runners.filter(v => v.status === 'Error')

  res.render('results',
    {
      title: 'Dashboard',
      user: req.user,
      completed: completed,
      inProgress: inProgress, // groups["running"],
      notStarted: notStarted, // groups["Not Started"],
      errors: errors // groups["Errors"]
    })

})

module.exports = router
