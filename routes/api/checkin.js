const express = require('express')
const router = express.Router()
const _ = require('underscore')
const moment = require('moment')

const RaceModel = require('../../models/Race')
const RunnerModel = require('../../models/Runner')
const CheckinModel = require('../../models/Checkin')

router.post('/', async(req, res) => {

  if (!req.user) {
    return res.status(500).send({ error: 'Not logged in' })
  }

  let result = await CheckinModel.create(req.body)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))
})

router.get('/', async(req, res) => {

  if (!req.user) {
    return res.status(500).send({ error: 'Not logged in' })
  }

  let result = await CheckinModel.find()
    .populate('race')
    .populate('runner')

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.get('/fakecheckins', async(req, res) => {

  if (!req.user) {
    return res.status(500).send({ error: 'Not logged in' })
  }

  let races = await RaceModel.find()
  let runners = await RunnerModel.find()

  let raceId = races[0]._id
  let raceTimes = moment()
    .subtract(1, 'days')

  let checkins = []

  runners.forEach(v => {
    checkins.push({
      race: raceId,
      runner: v._id,
      time: raceTimes.toISOString()
    })
    raceTimes = raceTimes.add(1, 'seconds')

  })

  raceTimes = raceTimes.add(20, 'minutes')

  runners.forEach(v => {
    checkins.push({
      race: raceId,
      runner: v._id,
      time: raceTimes.toISOString()
    })
    raceTimes = raceTimes.add(1, 'seconds')

  })

  let result = await CheckinModel.insertMany(checkins)
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.get('/:id', async(req, res) => {

  if (!req.user) {
    return res.status(500).send({ error: 'Not logged in' })
  }

  let result = await CheckinModel.findOne({ _id: req.params.id })
    .populate('race')
    .populate('runner')

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.put('/', async(req, res) => {

  if (!req.user) {
    return res.status(500).send({ error: 'Not logged in' })
  }

  let result = await CheckinModel.findByIdAndUpdate(req.params.id, req.body)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.delete('/:id', async(req, res) => {

  if (!req.user) {
    return res.status(500).send({ error: 'Not logged in' })
  }

  let result = await CheckinModel.findByIdAndDelete(req.params.id)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

module.exports = router