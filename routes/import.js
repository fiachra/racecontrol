var express = require('express');
var router = express.Router();
var csvjson = require('csvjson');
var _ = require("underscore");
var generator = require('../lib/qr-generator');
var dynamoFuncs = require('../lib/dynamo')

router.get('/', function(req, res)
{

    if (!req.user || req.user.status !== 'ENABLED')
    {
        return res.redirect('/login');
    }

    var data = {
        title: 'Import',
        user: req.user
    };

    //console.log(JSON.stringify(data, null, 2));

    res.render('studentimport', data);
});

router.post('/', function(req, res)
{

    if (!req.user || req.user.status !== 'ENABLED')
    {
        return res.redirect('/login');
    }

    var data = {
        title: 'Dashboard',
        user: req.user
    };

    var options = {
        delimiter: ','
    };
    var data = csvjson.toObject(req.body.studentData, options);
    var count = 1;
    _.each(data, function(person)
    {
        person.racenumber = count;
        count++;
    });

    var data2 = _.map(data, function(person)
    {
        return {
            Class: person.Class,
            racenumber: person.racenumber,
            Name: person["First Name"] + " " + person["Surname"]
        }
    })

    dynamoFuncs.populateStudentTable(data2, function(err)
    {
        if (err)
            res.send(err);
        else
        {
            res.redirect('/dashboard');
        }
    });
});

/*
router.get('/testTable', function(req, res)
{
    console.log("call");
    dynamoFuncs.tableExists("sdf",function(data){
        res.send(data)
    });

    
});
*/
module.exports = router;
