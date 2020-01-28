const express = require('express')
const router = express.Router()
const _ = require('underscore')
var RaceData = require('../../lib/RaceData')

router.post('/', async(req, res) => {
  let result = await RaceData.RunnerModel.create(req.body)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))
})

router.get('/', async(req, res) => {
  let result = await RaceData.RunnerModel.find()

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result.map(v => v._id)))

})

router.get('/:id', async(req, res) => {
  let result = await RaceData.RunnerModel.find(req.params.id)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.put('/', async(req, res) => {
  let result = await RaceData.RunnerModel.findByIdAndUpdate(req.params.id, req.body)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.delete('/:id', async(req, res) => {
  let result = await RaceData.RunnerModel.findByIdAndDelete(req.params.id)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

module.exports = router