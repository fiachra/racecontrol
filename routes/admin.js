var express = require('express');
var router = express.Router();
var dynamoFuncs = require('../lib/dynamo');
var studentInfo = require('../lib/studentInfoHolder');
var _ = require("underscore");
// Render the home page.
router.get('/', function(req, res)
{
    
    if (!req.user || req.user.status !== 'ENABLED')
    {
        return res.redirect('/login');
    }

    console.log(JSON.stringify(req.user, null, 2));

    studentInfo.initilize(function(err)
    {
        res.render('admin',
        {
            title: 'admin',
            user: req.user,
        });

    })

});

router.get('/resetrunners', function(req, res)
{
    if (!req.user || req.user.status !== 'ENABLED')
    {
        return res.redirect('/login');
    }

    var retval = {
        code: "correct"
    }

    res.send(JSON.stringify(retval));

});

router.get('/resettags', function(req, res)
{
    if (!req.user || req.user.status !== 'ENABLED')
    {
        return res.redirect('/login');
    }

    dynamoFuncs.refreshTagTable(function(err)
    {

        if (err)
            res.send(JSON.stringify(
            {
                code: "error"
            }));
        else
            res.send(JSON.stringify(
            {
                code: "complete"
            }));

    });

});

router.get('/resetboth', function(req, res)
{

    if (!req.user || req.user.status !== 'ENABLED')
    {
        return res.redirect('/login');
    }

    dynamoFuncs.resetDataStore(function(err)
    {

        if (err)
            res.send(JSON.stringify(
            {
                code: "error"
            }));
        else
            res.send(JSON.stringify(
            {
                code: "complete"
            }));

    });

});

router.get('/createfake', function(req, res)
{
    console.log("CF Route");
    if (!req.user || req.user.status !== 'ENABLED')
    {
        return res.redirect('/login');
    }
    
    studentInfo.fakeCheckinsMidRace(function(err)
    {

        if (err)
            res.send(JSON.stringify(
            {
                code: "error",
                error: err
            }));
        else
            res.send(JSON.stringify(
            {
                code: "complete"
            }));

    });

});

module.exports = router;
