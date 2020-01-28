var express = require('express')
var router = express.Router()
var dynamoFuncs = require('../lib/dynamo')
var _ = require('underscore')
var generator = require('../lib/qr-generator')
var studentInfo = require('../lib/studentInfoHolder')
var runnerInfo = require('../lib/RunnerInfo')
var classList
var async = require('async')
var moment = require('moment')

router.get('/', async(req, res, next) => {
  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login')
  // }

  let raceId = '5e2d7c675fa14339bf1b8ba0'

  await runnerInfo.updateForRaceID(raceId)

  res.render('runnerlist',
    {
      title: 'Runner List',
      classes: runnerInfo.runnersByClass
    })

})

router.get('/raceTabards', function(req, res, next) {

  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }

  res.render('pdflist',
    {
      title: 'Race Tabards',
      user: req.user,
      tabardFiles: studentInfo.tabardFiles
    })

})

router.get('/refreshTimingTable', function(req, res, next) {
  console.log('refreshing')
  dynamoFuncs.refreshTagTable(function(err) {
    if (err) { res.send(err) } else { res.send('table Refreshed') }

  })

})

router.post('/raceTabards', function(req, res, next) {

  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }

  studentInfo.generateTabards(function(err) {
    if (err) {
      res.send(err)
    } else {
      res.render('pdflist',
        {
          title: 'Race Tabards',
          user: req.user,
          tabardFiles: studentInfo.tabardFiles
        })
    }
  })

})

// Render the dashboard page.
router.get('/checkin/:racenumber', function(req, res) {

  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }

  var rn = parseInt(req.params.racenumber)
  var teacher = req.user.givenName + ' ' + req.user.surname
  var now = new Date()
  dynamoFuncs.addCheckin(rn, teacher, now.toISOString(), function(err) {
    if (err) { res.send(err) } else {
      console.log('RaceNumber:' + rn)
      var student = studentInfo.getStudentByRaceNumber(rn, data)

      if (student !== undefined) {
        var data = {
          title: 'Check-in',
          user: req.user,
          racenumber: req.params.racenumber,
          student: student,
          time: moment(now)
            .format('LTS')
        }

        console.log(JSON.stringify(data, null, 2))

        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data, null, 3))

        // res.render('checkin', data)
      } else {
        res.send('No student with that Number')
      }

    }
  })

})

router.get('/:racenumber', function(req, res, next) {
  console.log('users runner')
  /*
    if (!req.user || req.user.status !== 'ENABLED')
    {
        return res.redirect('/login');
    }
    */
  studentInfo.initilize(function(err) {
    if (err) {
      console.log(err)
    }
    console.log('init done')

    var runner = _.find(studentInfo.students, function(student) {
      return student.racenumber === parseInt(req.params.racenumber)
    })

    console.log(JSON.stringify(runner))

    res.render('runner',
      {
        title: 'Runner',
        user: req.user,
        runner: runner
      })
  })

})

router.get('/createFakeTimingTags', function(req, res, next) {
  /*
    console.log("faking route");

    studentInfo.fakeCheckins(function(err){
        if(err)
            res.send(err);
        else
            res.send("check-ins created");
    })
    */

})

module.exports = router
