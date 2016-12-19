var AWS = require("aws-sdk");
var async = require("async");

AWS.config.update(
{
    region: "eu-west-1",
    endpoint: "http://localhost:8000",
    accessKeyId: process.env['AWS_ACCESS_KEY'],
    secretAccessKey: process.env['AWS_SECRET_KEY']
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
    StudentsTableName: "StudentsTable",
    TimeTagTable: "TimeTagTable",
    populateStudentTable: function(students, callback)
    {
        var that = this;
        console.log("populate Students");

        async.waterfall([
            function(innerCB)
            {
                that.tableExists(that.StudentsTableName, function(exists)
                {
                    if (exists)
                    {
                        that.deleteTable(that.StudentsTableName, function(err)
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
                    else
                    {
                        innerCB();
                    }
                });
            },
            function(innerCB)
            {
                console.log("function 2");
                that.createStudentsTable(function(err)
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
            },

            function(innerCB)
            {
                async.each(students,
                    function(student, innerInnerCB)
                    {
                        var params = {
                            TableName: that.StudentsTableName,
                            Item:
                            {
                                "racenumber": student.racenumber,
                                "name": student.Name,
                                "class": student.Class
                            }
                        };

                        docClient.put(params, function(err, data)
                        {
                            if (err)
                            {
                                innerInnerCB(err)
                                console.error("Unable to add Student", student.Name, ". Error JSON:", JSON.stringify(err, null, 2));
                            }
                            else
                            {
                                innerInnerCB()
                            }
                        });

                    },
                    function(err)
                    {
                        if (err)
                        {
                            innerCB(err)
                        }
                        else
                        {
                            innerCB();
                        }
                    }
                );
            }

        ], function(err)
        {
            console.log("function end");
            if (err)
            {
                callback(err);
                console.log(err)
            }
            else
            {
                callback();
            }
        })

    },
    addCheckin: function(racenumber, teacher, dateStr, callback)
    {
        var that = this;
        var params = {
            TableName: that.TimeTagTable,
            Item:
            {
                "racenumber": racenumber,
                "time": dateStr,
                "teacher": teacher
            }
        };

        console.log(JSON.stringify(params, null, 2));

        docClient.put(params, function(err, data)
        {
            if (err)
            {
                callback(err)
            }
            else
            {
                callback()
            }
        });
    },
    createStudentsTable: function(callback)
    {
        var that = this;
        var params = {
            TableName: that.StudentsTableName,
            KeySchema: [
                {
                    AttributeName: "racenumber",
                    KeyType: "HASH"
                }, //Partition key
                {
                    AttributeName: "name",
                    KeyType: "RANGE"
                } //Sort key
            ],
            AttributeDefinitions: [
            {
                AttributeName: "racenumber",
                AttributeType: "N"
            },
            {
                AttributeName: "name",
                AttributeType: "S"
            }],
            ProvisionedThroughput:
            {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            }
        };

        dynamodb.createTable(params, function(err, data)
        {
            if (err)
            {
                callback(err);
                console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
            }
            else
            {
                callback();
                console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
            }
        });

    },
    refreshTagTable: function(callback)
    {
        var that = this;

        that.deleteTable(that.TimeTagTable, function(err)
        {
            if (err)
                callback(err)
            else
            {
                that.createTimeTagTable(function(err)
                {
                    if (err)
                    {
                        callback(err)
                    }
                    else
                    {
                        callback();
                    }
                })
            }

        })
    },
    createTimeTagTable: function(callback)
    {
        var that = this;
        var params = {
            TableName: that.TimeTagTable,
            KeySchema: [
                {
                    AttributeName: "time",
                    KeyType: "HASH"
                }, //Partition key
                {
                    AttributeName: "racenumber",
                    KeyType: "RANGE"
                } //Sort key
            ],
            AttributeDefinitions: [
            {
                AttributeName: "racenumber",
                AttributeType: "N"
            },
            {
                AttributeName: "time",
                AttributeType: "S"
            }],
            ProvisionedThroughput:
            {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            }
        };

        dynamodb.createTable(params, function(err, data)
        {
            if (err)
            {
                callback(err);
                console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
            }
            else
            {
                callback();
                console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
            }
        });

    },
    deleteTable: function(tableName, callback)
    {
        var params = {
            TableName: tableName
        };

        dynamodb.deleteTable(params, function(err, data)
        {
            if (err)
            {
                callback(err);
                console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
            }
            else
            {
                callback();
                console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
            }
        });

    },
    getAllTimingTags: function(callback)
    {
        var that = this;
        var tags = [];

        var params = {
            TableName: that.TimeTagTable,
            ProjectionExpression: "racenumber, #tm, teacher",
            ExpressionAttributeNames:
            {
                "#tm": "time"
            },

        };

        console.log("Scanning Students table.");
        docClient.scan(params, function(err, data)
        {
            if (err)
            {
                callback(err);
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            }
            else
            {
               
                [].push.apply(tags, data.Items);

                
                if (typeof data.LastEvaluatedKey != "undefined")
                {
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    docClient.scan(params, onScan);
                }
                else
                {
                    callback(null, tags);
                }
            }
        });
    },
    getAllStudents: function(callback)
    {
        var that = this;
        var students = [];

        var params = {
            TableName: that.StudentsTableName,
            ProjectionExpression: "racenumber, #nm, #cls",
            ExpressionAttributeNames:
            {
                "#nm": "name",
                "#cls": "class"
            },

        };

        console.log("Scanning Students table.");
        docClient.scan(params, function(err, data)
        {
            if (err)
            {
                callback(err);
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            }
            else
            {
                
                [].push.apply(students, data.Items);

                if (typeof data.LastEvaluatedKey != "undefined")
                {
                    
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    docClient.scan(params, onScan);
                }
                else
                {
                    callback(null, students);
                }
            }
        });

    },
    tableExists: function(tablename, callback)
    {
        var params = {
            TableName: this.StudentsTableName /* required */
        };

        dynamodb.describeTable(params, function(err, data)
        {
            if (err)
            {
                callback(false);
                console.log("Table Does Not Exist");

            }
            else
            {
                callback(true);
            }
        });

    },
    resetDataStore: function(callback)
    {
        var that = this;

        async.waterfall(
            [
                function(innerCB)
                {
                    that.deleteTable(that.StudentsTableName, function(err)
                    {
                        if (err)
                            innerCB(err)
                        else
                            innerCB();
                    });

                },
                function(innerCB)
                {
                    that.deleteTable(that.TimeTagTable, function(err)
                    {
                        if (err)
                            innerCB(err)
                        else
                            innerCB();
                    });

                },
                function(innerCB)
                {
                    that.createStudentsTable(function(err)
                    {
                        if (err)
                            innerCB(err)
                        else
                            innerCB();
                    });

                },
                function(innerCB)
                {
                    that.createTimeTagTable(function(err)
                    {
                        if (err)
                            innerCB(err)
                        else
                            innerCB();
                    });

                }
            ],
            function(err)
            {
                if (err)
                    callback(err);
                else
                    callback();
            }
        );

    }
};
