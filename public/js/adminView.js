$(function() {
  console.log('Results View')

  $('#createTags').click(function(e) {
    e.preventDefault()
    $.ajax(
      {
        url: globals.siteurl + '/admin/createtagstable',
        type: 'get',
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        xhrFields:
            {
              withCredentials: true
            },
        // data: dataset,
        success: function(data) {

          if (data.code === 'complete') {
            $('#createTagsStatus').html('correct')
          } else {
            $('#createTagsStatus').html('failed:' + data.code)
          }

        },
        error: function(data) {
          $('#createTagsStatus').html('call Failed')
        }
      })

  })

  $('#createRunners').click(function(e) {
    e.preventDefault()
    $.ajax(
      {
        url: globals.siteurl + '/admin/createrunnerstable',
        type: 'get',
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        xhrFields:
            {
              withCredentials: true
            },
        // data: dataset,
        success: function(data) {

          if (data.code === 'complete') {
            $('#createRunnersStatus').html('correct')
          } else {
            $('#createRunnersStatus').html('failed:' + data.code)
          }

        },
        error: function(data) {
          $('#createRunnersStatus').html('call Failed')
        }
      })

  })

  $('#deleteTags').click(function(e) {
    e.preventDefault()
    $.ajax(
      {
        url: globals.siteurl + '/admin/deletetagstable',
        type: 'get',
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        xhrFields:
            {
              withCredentials: true
            },
        // data: dataset,
        success: function(data) {

          if (data.code === 'complete') {
            $('#deleteTagsStatus').html('correct')
          } else {
            $('#deleteTagsStatus').html('failed:' + data.code)
          }

        },
        error: function(data) {
          $('#deleteTagsStatus').html('call Failed')
        }
      })

  })

  $('#deleteRunners').click(function(e) {
    e.preventDefault()
    $.ajax(
      {
        url: globals.siteurl + '/admin/deleterunnerstable',
        type: 'get',
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        xhrFields:
            {
              withCredentials: true
            },
        // data: dataset,
        success: function(data) {

          if (data.code === 'complete') {
            $('#deleteRunnersStatus').html('correct')
          } else {
            $('#deleteRunnersStatus').html('failed:' + data.code)
          }

        },
        error: function(data) {
          $('#deleteRunnersStatus').html('call Failed')
        }
      })

  })

  $('#createFake').click(function(e) {
    e.preventDefault()

    $.ajax(
      {
        url: globals.siteurl + '/admin/createfake',
        type: 'get',
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        // data: dataset,
        success: function(data) {

          if (data.code === 'complete') {
            $('#createFakeStatus').html('complete')
          } else {
            $('#createFakeStatus').html('Failed:' + data.code)
          }

        },
        error: function(data) {
          $('#createFakeStatus').html('Call Failed')
        }
      })

  })

})
