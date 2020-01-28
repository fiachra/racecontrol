const express = require('express')
const router = express.Router()
const _ = require('underscore')
var RaceData = require('../../lib/RaceData')

router.post('/', async(req, res) => {
  let result = await RaceData.createRace(req.body)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))
})

router.get('/', async(req, res) => {
  let result = await RaceData.getRace()
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.get('/:id', async(req, res) => {
  let result = await RaceData.getRace(req.params.id)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.put('/', async(req, res) => {
  let result = await RaceData.updateRace(req.params.id, req.body)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

router.delete('/:id', async(req, res) => {
  let result = await RaceData.deleteRace(req.params.id)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

module.exports = router