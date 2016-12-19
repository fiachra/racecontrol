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
    
    studentInfo.initilize(function(err)
    {

        var groups = _.groupBy(studentInfo.students, function(student){return student.status});
        var completed = [];
        var inProgress = [];
        var notStarted = [];
        var errors = [];

        if(groups["complete"]){
            completed = groups["complete"];
            //completed = _.sortBy(completed, function(student){return student.tags[1].time;});
            completed = _.sortBy(completed, function(student){return student.durationMs;})
        }

        if(groups["running"]){
            inProgress = groups["running"];
            inProgress = _.sortBy(inProgress, function(student){return student.tags[0].time;});
        }

        if(groups["Not Started"])
            notStarted = groups["Not Started"];

        if(groups["Errors"])
            errors = groups["Errors"];


        res.render('results',
        {
            title: 'Dashboard',
            user: req.user,
            completed: completed,
            inProgress: inProgress,//groups["running"],
            notStarted: notStarted,//groups["Not Started"],
            errors: errors,//groups["Errors"]
        });

    })

});


module.exports = router;
