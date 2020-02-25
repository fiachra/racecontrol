const express = require('express')
const router = express.Router()

const RunnerModel = require('../models/Runner')
const CheckinModel = require('../models/Checkin')

const csvParse = require('csv-parse')
const csvParseProm = (data, options = {}) => {
  return new Promise(function(resolve, reject) {
    csvParse(data, options, function(err, output) {
      if (err) {
        reject(err)
      } else {
        resolve(output)
      }
    })
  })
}

router.get('/', async(req, res, next) => {
  if (!req.user) {
    return res.redirect('/login')
  }

  let runners = await RunnerModel.find()
  let runnersByClass = runners.reduce((a, v) => {

    let runnerClass = a.find(c => c.name === v.class)

    if (!runnerClass) {
      runnerClass = {
        name: v.class,
        runners: []
      }

      a.push(runnerClass)
    }

    runnerClass.runners.push(v)

    return a
  }, [])

  runnersByClass.sort((a, b) => a.name.localeCompare(b.name))
  res.render('runners',
    {
      title: 'Runner List',
      classes: runnersByClass,
      user: req.user
    })

})

router.post('/import', async(req, res) => {

  if (!req.user) {
    return res.redirect('/login')
  }

  let data = await csvParseProm(req.body.studentData, { columns: true })

  let valid = data.reduce((a, v) => {
    return a && v.name && v.class
  }, true)

  if (valid) {
    try {
      let result = await RunnerModel.insertMany(data)
      return res.redirect('/runners')
    } catch (err) {
      console.log(err)
    }
  }

})

router.delete('/allrunners', async(req, res) => {

  if (!req.user) {
    return res.redirect('/login')
  }

  if (req.user.role !== 'admin') {
    return res.send('not an admin')
  }

  let runners = await RunnerModel.deleteMany()
  let checkins = await CheckinModel.deleteMany()

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ runners, checkins }))

})

module.exports = router
