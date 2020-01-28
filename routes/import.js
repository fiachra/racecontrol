const express = require('express')
const router = express.Router()
const _ = require('underscore')
const RaceData = require('../lib/RaceData')
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

router.get('/', function(req, res) {

  // if (!req.isAuthenticated()) {
  //   return res.redirect('/login')
  // }

  var data = {
    title: 'Import',
    user: req.user
  }

  res.render('studentimport', data)
})

router.post('/', async(req, res) => {

  // if (!req.user || req.user.status !== 'ENABLED') {
  //   return res.redirect('/login')
  // }

  let data = await csvParseProm(req.body.studentData, { columns: true })

  let valid = data.reduce((a, v) => {
    return a && v.name && v.class
  }, true)

  if (valid) {
    try {
      let result = await RaceData.RunnerModel.insertMany(data)
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(result))
    } catch (err) {
      console.log(err)
    }
  }

})

router.delete('/allrunners', async(req, res) => {

  // if (!req.user || req.user.status !== 'ENABLED') {
  //   return res.redirect('/login')
  // }

  let result = await RaceData.RunnerModel.deleteMany()
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))

})

/*
router.get('/testTable', function(req, res)
{
    console.log("call");
    dynamoFuncs.tableExists("sdf",function(data){
        res.send(data)
    });

});
*/
module.exports = router
