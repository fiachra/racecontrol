$(function()
{
    console.log("Results View");

    $('#resetRunners').click(function(e)
    {
        e.preventDefault();
        $.ajax(
        {
            url: "http://localhost:3000/admin/test",
            type: "get",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            //data: dataset,
            success: function(data)
            {

                if (data.code === "correct")
                {
                    $('#resetRunnersStatus').html("correct");
                }
                else
                {
                    $('#resetRunnersStatus').html("incorrect");
                }

            },
            error: function(data)
            {
                $('#resetRunnersStatus').html("failed");
            }
        });

    });

    $('#resetTags').click(function(e)
    {
        e.preventDefault();

        $.ajax(
        {
            url: "http://localhost:3000/admin/resettags",
            type: "get",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            //data: dataset,
            success: function(data)
            {

                if (data.code === "complete")
                {
                    $('#resetTagsStatus').html("complete");
                }
                else
                {
                    $('#resetTagsStatus').html("failed");
                }

            },
            error: function(data)
            {
                $('#resetTagsStatus').html("Call Failed");
            }
        });

    });

    $('#resetBoth').click(function(e)
    {
        e.preventDefault();

        $.ajax(
        {
            url: "http://localhost:3000/admin/resetboth",
            type: "get",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            //data: dataset,
            success: function(data)
            {

                if (data.code === "complete")
                {
                    $('#resetBothStatus').html("complete");
                }
                else
                {
                    $('#resetBothStatus').html("failed");
                }

            },
            error: function(data)
            {
                $('#resetBothStatus').html("Call Failed");
            }
        });

    });

    $('#createFake').click(function(e)
    {
        e.preventDefault();

        $.ajax(
        {
            url: "http://localhost:3000/admin/createfake",
            type: "get",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            //data: dataset,
            success: function(data)
            {

                if (data.code === "complete")
                {
                    $('#createFakeStatus').html("complete");
                }
                else
                {
                    $('#createFakeStatus').html("failed");
                }

            },
            error: function(data)
            {
                $('#createFakeStatus').html("Call Failed");
            }
        });

    });

});
