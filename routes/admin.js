var express = require('express')
var router = express.Router()
var _ = require('underscore')
// Render the home page.
router.get('/', function(req, res) {

  if (!req.user || req.user.role !== 'admin') {
    return res.redirect('/login')
  }

  console.log(JSON.stringify(req.user, null, 2))
  res.render('admin',
    {
      title: 'Admin',
      user: req.user
    })

})

module.exports = router
