var express = require('express');
var router = express.Router();
var dynamoFuncs = require('../lib/dynamo');
var studentInfo = require('../lib/studentInfoHolder');
var _ = require("underscore");
// Render the home page.
router.get('/', function(req, res)
{

    studentInfo.initilize(function(err)
    {
        console.log("HERE")

        var groups = _.groupBy(studentInfo.students, function(student){return student.status});
        var completed = [];
        var inProgress = [];
        var notStarted = [];
        var errors = [];

        if(groups["complete"])
            completed = groups["complete"];

        if(groups["running"])
            inProgress = groups["running"];

        if(groups["Not Started"])
            notStarted = groups["Not Started"];

        if(groups["Errors"])
            errors = groups["Errors"];


        res.render('resultsTest',
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
