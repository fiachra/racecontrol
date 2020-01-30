const express = require('express')
const router = express.Router()
const _ = require('underscore')
const RaceModel = require('../../models/Race')
const RunnerModel = require('../../models/Runner')
const CheckinModel = require('../../models/Checkin')

router.post('/', async(req, res) => {
  let result = await RunnerModel.create(req.body)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))
})

router.get('/', async(req, res) => {
  let result = await RunnerModel.find()

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result.map(v => v._id)))

})

router.get('/:id', async(req, res) => {
  let result = await RunnerModel.find(req.params.id)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.put('/', async(req, res) => {
  let result = await RunnerModel.findByIdAndUpdate(req.params.id, req.body)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.delete('/:id', async(req, res) => {
  let tags = await CheckinModel.deleteMany({ runner: req.params.id })
  let runner = await RunnerModel.findByIdAndDelete(req.params.id)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ tags, runner }))

})

module.exports = router