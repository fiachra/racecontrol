const express = require('express')
const router = express.Router()
const _ = require('underscore')
const RaceData = require('../../lib/RaceData')
const moment = require('moment')
const Checkin = require('../../models/Checkin')

router.post('/', async(req, res) => {
  let result = await Checkin.create(req.body)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))
})

router.get('/', async(req, res) => {
  let result = await Checkin.find()
    .populate('race')
    .populate('runner')

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.get('/fakecheckins', async(req, res) => {
  let races = await RaceData.RaceModel.find()
  let runners = await RaceData.RunnerModel.find()

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

  let result = await Checkin.insertMany(checkins)
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.get('/:id', async(req, res) => {
  let result = await Checkin.findOne({ _id: req.params.id })
    .populate('race')
    .populate('runner')

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.put('/', async(req, res) => {
  let result = await Checkin.findByIdAndUpdate(req.params.id, req.body)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.delete('/:id', async(req, res) => {
  let result = await Checkin.findByIdAndDelete(req.params.id)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

module.exports = router