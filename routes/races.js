const express = require('express')
const router = express.Router()
const _ = require('underscore')
var RaceData = require('../lib/RaceData')
var runnerInfo = require('../lib/RunnerInfo')
var qrGen = require('../lib/qr-generator')
var moment = require('moment')

router.get('/', async(req, res) => {

  if (!req.user) {
    return res.redirect('/login')
  }

  let result = await RaceData.RaceModel.find()

  result.forEach(v => {
    v.startTimeStr = moment(v.startTime).format('MMM DD, hh:mma')
  })

  res.render('races',
    {
      title: 'Race List',
      user: req.user,
      races: result
    })

})

router.get('/:id', async(req, res) => {
  let race = await RaceData.RaceModel.findById(req.params.id)

  if (!req.user) {
    return res.redirect('/login')
  }

  await runnerInfo.updateForRaceID(race._id)
  await qrGen.createImages(runnerInfo)
  await qrGen.createPDFs(runnerInfo)

  var completed = runnerInfo.runners.filter(v => v.status === 'Complete')
  var inProgress = runnerInfo.runners.filter(v => v.status === 'Running')
  var notStarted = runnerInfo.runners.filter(v => v.status === 'Not Started')
  var errors = runnerInfo.runners.filter(v => v.status === 'Error')

  res.render('race',
    {
      title: 'Race Results',
      user: req.user,
      completed: completed,
      inProgress: inProgress, // groups["running"],
      notStarted: notStarted, // groups["Not Started"],
      errors: errors, // groups["Errors"]
      classes: runnerInfo.runnersByClass,
      allRunnersPDF: runnerInfo.allRunnerPDF
    })

})

module.exports = router