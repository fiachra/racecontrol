var video = document.createElement('video')
var canvasElement = document.getElementById('canvas')
var canvas = canvasElement.getContext('2d')
var loadingMessage = document.getElementById('loadingMessage')
var outputContainer = document.getElementById('output')
var outputMessage = document.getElementById('outputMessage')
var outputData = document.getElementById('outputData')
var paused = false

function drawLine(begin, end, color) {
  canvas.beginPath()
  canvas.moveTo(begin.x, begin.y)
  canvas.lineTo(end.x, end.y)
  canvas.lineWidth = 4
  canvas.strokeStyle = color
  canvas.stroke()
}

function request(data, callback) {

  var xobj = new XMLHttpRequest()
  // true parameter denotes asynchronous
  xobj.open('GET', data, true)
  xobj.onreadystatechange = function() {
    if (xobj.readyState == 4 && xobj.status == '200') {
      // This marks that the response has been successfully retrieved from the server
      // Utilize callback
      callback(xobj.responseText)
    }
  }
  xobj.send(null)
}

// Use facingMode: environment to attemt to get the front camera on phones
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then(function(stream) {
    video.srcObject = stream
    video.setAttribute('playsinline', true) // required to tell iOS safari we don't want fullscreen
    video.play()
    requestAnimationFrame(tick)
  })

function tick() {
  loadingMessage.innerText = '⌛ Loading video...'
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    loadingMessage.hidden = true
    canvasElement.hidden = false
    outputContainer.hidden = false

    canvasElement.height = video.videoHeight
    canvasElement.width = video.videoWidth
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height)
    var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height)
    var code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    })
    if (code && !paused) {
      paused = true
      setTimeout(function() { paused = false }, 2000)
      drawLine(code.location.topLeftCorner, code.location.topRightCorner, '#FF3B58')
      drawLine(code.location.topRightCorner, code.location.bottomRightCorner, '#FF3B58')
      drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, '#FF3B58')
      drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, '#FF3B58')
      outputMessage.hidden = true
      outputData.parentElement.hidden = false

      request(code.data, function(text) {
        var data = JSON.parse(text)
        var string = `${data.student.name} checked in at ${data.time}`
        outputData.innerText = string
        console.log(string)
      })
      console.log(code.data)
    } else {
      // outputMessage.hidden = false
      // outputData.parentElement.hidden = true
    }
  }
  requestAnimationFrame(tick)
}