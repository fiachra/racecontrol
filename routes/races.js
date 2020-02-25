const express = require('express')
const router = express.Router()
const _ = require('underscore')
const runnerInfo = require('../lib/RunnerInfo')
const qrGen = require('../lib/qr-generator')
const moment = require('moment')

const RaceModel = require('../models/Race')
const RunnerModel = require('../models/Runner')
const CheckinModel = require('../models/Checkin')

router.get('/', async(req, res) => {

  if (!req.user) {
    return res.redirect('/login')
  }

  let result = await RaceModel.find()

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
  let race = await RaceModel.findById(req.params.id)

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

  completed.sort((a, b) => a.timeMilli - b.timeMilli)

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

router.get('/:raceId/runner/:runnerId', async(req, res) => {

  if (!req.user) {
    return res.redirect('/login')
  }

  let race = await RaceModel.findById(req.params.raceId)

  if (!race || !race._id) {
    return res.status(500).send({ error: 'Bad Race ID' })
  }

  let runner = await RunnerModel.findById(req.params.runnerId)

  if (!runner || !runner._id) {
    return res.status(500).send({ error: 'Bad Runner ID' })
  }

  runner.tags = await CheckinModel.find({ race: race._id, runner: runner._id })

  res.render('runner',
    {
      title: 'Runner',
      user: req.user,
      runner
    })
})

module.exports = router