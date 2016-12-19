var express = require('express');
var router = express.Router();
var dynamoFuncs = require('../lib/dynamo')
var _ = require("underscore");
var generator = require('../lib/qr-generator');
var studentInfo = require('../lib/studentInfoHolder');
var classList = undefined;
var async = require("async");

router.get('/', function(req, res, next)
{
    if (!req.user || req.user.status !== 'ENABLED')
    {
        return res.redirect('/login');
    }

    res.render('userlist',
    {
        title: 'Home',
        user: req.user,
        classes: studentInfo.studentsByClass
    });

});

router.get('/raceTabards', function(req, res, next)
{
    
    if (!req.user || req.user.status !== 'ENABLED')
    {
        return res.redirect('/login');
    }
    

    res.render('pdflist',
    {
        title: 'Home',
        user: req.user,
        tabardFiles: studentInfo.tabardFiles
    });

});

router.get('/createFakeTimingTags', function(req, res, next)
{
    /*
    console.log("faking route");
    
    studentInfo.fakeCheckins(function(err){
        if(err)
            res.send(err);
        else
            res.send("check-ins created");
    })
    */

});

router.get('/refreshTimingTable', function(req, res, next)
{
    console.log("refreshing");
    dynamoFuncs.refreshTagTable(function(err){
        if(err)
            res.send(err)
        else
            res.send("table Refreshed");

    })

});

router.post('/raceTabards', function(req, res, next)
{
    
    if (!req.user || req.user.status !== 'ENABLED')
    {
        return res.redirect('/login');
    }
    
    studentInfo.generateTabards(function(err)
    {
        if (err)
        {
            res.send(err)
        }
        else
        {
            res.render('pdflist',
            {
                title: 'Home',
                user: req.user,
                tabardFiles: studentInfo.tabardFiles
            });
        }
    })

});

// Render the dashboard page.
router.get('/checkin/:racenumber', function(req, res)
{

    if (!req.user || req.user.status !== 'ENABLED')
    {
        return res.redirect('/login');
    }

    var rn = parseInt(req.params.racenumber);
    var teacher = req.user.givenName + " " + req.user.surname;
    dynamoFuncs.addCheckin(rn, teacher, function(err)
    {
        if (err)
            res.send(err)
        else
        {
            var student = studentInfo.getStudentByRaceNumber(rn, data);

            if (student !== undefined)
            {
                var data = {
                    title: 'Dashboard',
                    user: req.user,
                    racenumber: req.params.racenumber,
                    student: student
                };

                console.log(JSON.stringify(data, null, 2));

                res.render('checkin', data);
            }
            else
            {
                res.render('error',
                {
                    message: "No student with that name"
                });
            }

        }
    });

});

module.exports = router;
