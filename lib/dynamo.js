var AWS = require("aws-sdk");
var async = require("async");

AWS.config.update(
{
    region: "eu-west-1",
    //endpoint: "http://localhost:8000",
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

        async.each(students,
            function(student, innerCB)
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
                        innerCB(err)

                        console.error("Unable to add Student", student.Name, ". Error JSON:", JSON.stringify(err, null, 2));
                    }
                    else
                    {
                        setTimeout(function()
                        {
                            console.log("created " + student.Name)
                            innerCB()
                        }, 200)
                    }
                });

            },
            function(err)
            {
                if (err)
                {
                    callback(err)
                }
                else
                {
                    callback();
                }
            }
        );

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
                WriteCapacityUnits: 2
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
                that.tableCreationComplete(that.StudentsTableName, 0, callback);
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
            {
                callback(err)
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
        console.log("creating TimeTagTable");
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
                WriteCapacityUnits: 2
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
                //callback();
                that.tableCreationComplete(that.TimeTagTable, 0, callback);
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
    tableCreationComplete: function(tableName, count, callback)
    {
        var that = this;
        console.log("Checking TableCreation " + count);

        count++;

        var params = {
            TableName: tableName /* required */
        };
        if (count < 15)
        {
            dynamodb.describeTable(params, function(err, data)
            {
                if (err)
                {
                    console.log(JSON.stringify(err, null, 2));
                    setTimeout(function()
                    {
                        that.tableCreationComplete(tableName, count, callback);
                    }, 1000)

                }
                else
                {
                    console.log(JSON.stringify(data, null, 2));
                    if (data.Table.TableStatus === "ACTIVE")
                        callback()
                    else
                    {
                        setTimeout(function()
                        {
                            that.tableCreationComplete(tableName, count, callback);
                        }, 1000)
                    }
                }

            });
        }
        else
        {
            callback("timeout");
        }

    },
    tableDeletionComplete: function(tableName, count, callback)
    {
        var that = this;
        console.log("Checking TableCreation " + count);

        count++;

        var params = {
            TableName: tableName /* required */
        };
        if (count < 15)
        {
            dynamodb.describeTable(params, function(err, data)
            {
                if (err)
                {
                    console.log(JSON.stringify(err, null, 2));
                    setTimeout(function()
                    {
                        that.tableCreationComplete(tableName, count, callback);
                    }, 1000)

                }
                else
                {
                    console.log(JSON.stringify(data, null, 2));
                    if (data.Table.TableStatus === "ACTIVE")
                        callback()
                    else
                    {
                        setTimeout(function()
                        {
                            that.tableCreationComplete(tableName, count, callback);
                        }, 1000)
                    }
                }

            });
        }
        else
        {
            callback("timeout");
        }

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
