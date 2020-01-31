const express = require('express')
const router = express.Router()
const _ = require('underscore')

const RaceModel = require('../../models/Race')
const CheckinModel = require('../../models/Checkin')

router.post('/', async(req, res) => {

  if (!req.user) {
    return res.status(500).send({ error: 'Not logged in' })
  }

  let result = await RaceModel.create(req.body)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))
})

router.get('/', async(req, res) => {

  if (!req.user) {
    return res.status(500).send({ error: 'Not logged in' })
  }

  let result = await RaceModel.find()
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.get('/:id', async(req, res) => {

  if (!req.user) {
    return res.status(500).send({ error: 'Not logged in' })
  }

  let result = await RaceModel.findById(req.params.id)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.put('/', async(req, res) => {

  if (!req.user) {
    return res.status(500).send({ error: 'Not logged in' })
  }

  let result = await RaceModel.findByIdAndUpdate(req.params.id, req.body)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.delete('/:id', async(req, res) => {

  if (!req.user) {
    return res.status(500).send({ error: 'Not logged in' })
  }

  let tags = await CheckinModel.deleteMany({ race: req.params.id })
  let race = await RaceModel.findByIdAndDelete(req.params.id)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ tags, race }))

})

module.exports = router