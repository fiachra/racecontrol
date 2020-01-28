var qr = require('qr-image')
var PDFDocument = require('pdfkit')
var fs = require('fs')
var xml2js = require('xml2js')
var async = require('async')
var _ = require('underscore')
var moment = require('moment')
var RaceData = require('../lib/RaceData')
const path = require('path')
const filePath = path.join(__basedir, 'public/files')
const images = path.join(filePath, 'images')

// const svgSize = 31
const svgSize = 31
const pageWidth = 595
const finalSizeRatio = 0.5

const finalWidth = pageWidth * finalSizeRatio
const scale = (pageWidth / svgSize) * finalSizeRatio
const offsetForCenter = (pageWidth / 2) - (finalWidth / 2)

var urlStr = 'https://www.schoolracecontrol.eu/users/checkin'
var baseURL = process.env.BASE_URL

module.exports = {
  urlStr: `${baseURL}/users/checkin`,
  pad: function(str, max) {
    return str.length < max ? this.pad('0' + str, max) : str
  },
  async createImages(runnerInfo, force = false) {
    let runners = runnerInfo.runners

    for (let runner of runners) {
      let filename = path.join(images, `${runnerInfo.raceID}_${runner._id}.svg`)
      if (!fs.existsSync(filename) || force) {
        let qrURL = `${baseURL}/checkin/race/${runnerInfo.raceID}/runner/${runner._id}`
        let outputStream = fs.createWriteStream(filename)
        await new Promise((resolve, reject) => {
          outputStream.on('finish', () => {
            console.log(`${filename} Done`)
            resolve()
          })
          qr.image(qrURL, { type: 'svg', size: 5 }).pipe(outputStream)
        })

      }
    }

    for (let classGroup of runnerInfo.runnersByClass) {
      await this.createClassPdf(classGroup, runnerInfo.raceID, force)
    }

  },
  createClassPdf: async function(classGroup, raceID, force) {

    let pdfPath = path.join(filePath, 'pdfs')
    let filename = `${classGroup.name}_${raceID}.pdf`
    let classPdfFilePath = path.join(pdfPath, filename)
    let generateTime = moment().toISOString()

    if (!fs.existsSync(classPdfFilePath) || force) {
      let doc = new PDFDocument(
        {
          size: 'A4',
          layout: 'portrait'
        })

      doc.pipe(fs.createWriteStream(classPdfFilePath))

      for (let runner of classGroup.runners) {
        let runnerSVGFile = path.join(images, `${raceID}_${runner._id}.svg`)
        let svgString = fs.readFileSync(runnerSVGFile, 'utf8')
        let svgResult = await xml2js.parseStringPromise(svgString)
        let pthString = svgResult.svg.path[0].$.d

        doc.image('public/images/schlogo.jpg', 30, 30,
          {
            width: 75
          })

        doc.fontSize(40)
          .text('Confey College Run',
            {
              align: 'center'
            })
          .moveDown()

        doc.fontSize(35)
          .text(runner.name,
            {
              align: 'center'
            })

        doc.translate(90, 300)
          .scale(scale)
          .path(pthString)
          .fill()
          .restore()

        var now = moment(new Date(generateTime))
        var string = 'Generated: ' + now.format('llll')

        doc.fontSize(10).text(string, 20, doc.page.height - 10, {
          lineBreak: false
        })

        doc.addPage()
      }
      doc.end()

      console.log(filename)
    }

  }
}
