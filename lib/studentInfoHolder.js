var dynamoFuncs = require('../lib/dynamo')
var _ = require("underscore");
var generator = require('../lib/qr-generator');
var async = require("async");
var moment = require("moment");

module.exports = {
    students: [],
    studentsByClass: [],
    tabardFiles: [],
    timingTags: [],
    initilize: function(callback)
    {
        var that = this;

        async.waterfall([
                function(innerCB)
                {
                    console.log("HERE1")
                    that.updateStudentInfo(function(err)
                    {
                        if (err)
                            innerCB(err);
                        else
                            innerCB();
                    })
                },
                function(innerCB)
                {
                    console.log("HERE2")
                    that.createTabardFileList();
                    //console.log(JSON.stringify(that.tabardFiles, null, 2));
                    innerCB();
                },
                function(innerCB)
                {
                    that.updateTimeTags(function(err, data)
                    {
                        if (err)
                        {
                            innerCB(err);
                        }
                        else
                        {
                            innerCB();
                        }
                    });
                }
            ],
            function(err)
            {
                if (err)
                {
                    callback(err)
                }
                else
                    callback();

            });

    },
    updateStudentInfo: function(callback)
    {
        var that = this;

        dynamoFuncs.getAllStudents(function(err, data)
        {
            if (err)
            {
                console.log("getting Suudents failed")
                callback(err)
            }
            else
            {
                that.students = data;
                that.studentsByClass = that.processUserFiles(data);
                callback(null);
            }
        })

    },
    getStudentByRaceNumber: function(racenumber, classList)
    {
        var that = this;

        var found = undefined;

        var search = _.find(that.students, function(student)
        {
            return student.racenumber === racenumber;
        });

        console.log("found:" + JSON.stringify(found));

        return found;
    },
    processUserFiles: function(data)
    {
        var grouped = _.groupBy(data, function(person)
        {
            return person.class;
        });

        var classes = []

        Object.keys(grouped).forEach(function(key, index)
        {
            var classGroup = {
                name: key,
                students: grouped[key]
            }
            classes.push(classGroup);
        });

        classes = _.sortBy(classes, function(classGroup)
        {
            return classGroup.name;
        });

        _.each(classes, function(classGroup)
        {
            classGroup.students = _.sortBy(classGroup.students, function(student)
            {
                return student.name;
            });
        })

        return classes;

    },
    processTimeTags: function(data)
    {
        var that = this;

        _.each(that.students, function(student)
        {
            student.status = "Not Started";
        });

        var grouped = _.groupBy(data, function(tag)
        {
            return tag.racenumber;
        });
        //console.log(JSON.stringify(grouped, null, 2));

        Object.keys(grouped).forEach(function(key, index)
        {
            var foundStu = _.find(that.students, function(student)
            {
                return student.racenumber === grouped[key][0].racenumber;
            });

            foundStu.tags = grouped[key].sort(function(a, b)
            {
                return (a.time > b.time) ? -1 : ((a.time < b.time) ? 1 : 0);
            });

            if (foundStu.tags.length === 1)
            {
                foundStu.status = "running";
                foundStu.starttimestr = moment(foundStu.tags[0].time).format("LTS");
            }
            else if (foundStu.tags.length === 2)
            {
                foundStu.status = "complete";
                var start = moment(foundStu.tags[1].time);
                var end = moment(foundStu.tags[0].time);
                var raceTime = moment.duration(end.diff(start));
                foundStu.durationMs = raceTime.asMilliseconds();
                foundStu.starttimestr = moment(foundStu.tags[1].time).format("LTS");
                foundStu.endtimestr = moment(foundStu.tags[0].time).format("LTS");
                foundStu.durationstr = raceTime.minutes() + ":" + raceTime.seconds() + "." + raceTime.milliseconds()

                //console.log(start.format("h:mm:ss.SS") + " " + end.format("h:mm:ss.SS") + " " + end.diff(start));

            }
            else if (foundStu.tags.length > 2)
            {
                foundStu.status = "Error";
            }
        });
        console.log(JSON.stringify(that.getClassList(), null, 2));

    },
    getClassList()
    {
        var that = this;
        var uniqueList = _.uniq(that.students, function(student)
        {
            return student.class;
        })
        var classList = [];
        _.each(uniqueList, function(uniqItem)
        {
            classList.push(uniqItem.class);
        })

        classList = _.sortBy(classList, function(cls)
        {
            return cls;
        });

        return classList;

    },
    generateTabards: function(callback)
    {
        var that = this;
        console.log("generating");
        console.log(JSON.stringify(that.studentsByClass, null, 2));
        that.tabardFiles = [];
        async.eachSeries(that.studentsByClass, function(classList, innerCB)
        {
            console.log("generator: " + classList.name);
            generator.createListPdf(classList.name, classList.students, function(err, data)
            {
                if (err)
                    innerCB(err)
                else
                {
                    that.tabardFiles.push(data);
                    //clear the stack
                    setTimeout(function()
                    {
                        innerCB();
                    }, 0);

                }

            });
        }, function(err)
        {
            callback(err);
        })

    },
    createTabardFileList: function()
    {
        var that = this;
        that.tabardFiles = [];
        _.each(that.studentsByClass, function(classGroup)
        {
            //console.log("generator: " + classGroup.name);
            var retVal = {
                className: classGroup.name,
                filename: 'Class_' + classGroup.name + '.pdf',
                url: '/files/Class_' + classGroup.name + '.pdf'
            }

            that.tabardFiles.push(retVal);

        });

    },
    fakeCheckins: function(callback)
    {
        console.log("faking");
        var that = this;
        var moveTime = moment();
        async.eachSeries(that.students,
            function(student, innerCB)
            {
                console.log("faking2");
                async.waterfall([
                    function(ininCB)
                    {
                        console.log("faking3");
                        var startTime = moveTime;
                        dynamoFuncs.addCheckin(student.racenumber, "fiachra", startTime.toISOString(), function(err)
                        {
                            if (err)
                                ininCB(err)
                            else
                                ininCB();
                        });
                    },
                    function(ininCB)
                    {
                        console.log("faking4");
                        //780 - 3000
                        var endTime = moveTime.add(that.getRandomInt(780, 3000), 'seconds');
                        dynamoFuncs.addCheckin(student.racenumber, "fiachra", endTime.toISOString(), function(err)
                        {
                            if (err)
                                ininCB(err)
                            else
                                ininCB();
                        });
                    }
                ], function(err)
                {
                    if (err)
                        innerCB(err)
                    else
                    {
                        moveTime = moveTime.add(that.getRandomInt(3, 15), "seconds");
                        innerCB();
                    }
                })

            },
            function(err)
            {
                if (err)
                    callback(err)
                else
                {
                    callback();
                }
            });

    },
    fakeCheckinsMidRace: function(callback)
    {
        console.log("faking");
        var that = this;
        var moveTime = moment();
        
        async.eachSeries(that.students,
            function(student, innerCB)
            {
                var running = that.getRandomInt(0, 10);

                if (running === 5)
                {
                    console.log("didn't run");
                    innerCB();
                }
                else
                {
                    console.log("faking2");
                    async.waterfall([
                        function(ininCB)
                        {
                            console.log("faking3");
                            var startTime = moment(moveTime);
                            dynamoFuncs.addCheckin(student.racenumber, "fiachra", startTime.toISOString(), function(err)
                            {
                                if (err)
                                    ininCB(err)
                                else
                                    ininCB();
                            });
                        },
                        function(ininCB)
                        {
                            console.log("faking4");
                            //780 - 3000
                            var raceTime = that.getRandomInt(780, 3000);
                            if (raceTime > 1800)
                            {
                                var endTime = moment(moveTime).add(raceTime, 'seconds');
                                dynamoFuncs.addCheckin(student.racenumber, "fiachra", endTime.toISOString(), function(err)
                                {
                                    if (err)
                                        ininCB(err)
                                    else
                                        ininCB();
                                });
                            }
                            else
                            {
                                ininCB();
                            }
                        }
                    ], function(err)
                    {
                        if (err)
                            innerCB(err)
                        else
                        {
                            moveTime = moveTime.add(that.getRandomInt(1, 5), "seconds");
                            innerCB();
                        }
                    })
                }

            },
            function(err)
            {
                if (err)
                    callback(err)
                else
                {
                    callback();
                }
            });

    },
    getRandomInt: function(min, max)
    {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },
    updateTimeTags: function(callback)
    {
        var that = this;

        that.timingTags = [];

        dynamoFuncs.getAllTimingTags(function(err, data)
        {
            if (err)
            {
                console.log("getting Suudents failed")
                callback(err)
            }
            else
            {
                that.timingTags = data;
                that.processTimeTags(data);
                callback();
            }
        })

    }

};
