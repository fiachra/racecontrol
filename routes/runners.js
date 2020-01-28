var express = require('express')
var router = express.Router()
const RaceData = require('../lib/RaceData')

router.get('/', async(req, res, next) => {
  if (!req.user) {
    return res.redirect('/login')
  }

  let runners = await RaceData.RunnerModel.find()
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

  res.render('runnerlist',
    {
      title: 'Runner List',
      classes: runnersByClass,
      user: req.user
    })

})

module.exports = router
