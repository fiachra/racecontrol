var qr = require('qr-image')
var PDFDocument = require('pdfkit')
var fs = require('fs')
var xml2js = require('xml2js')
var moment = require('moment')
const path = require('path')
const filePath = path.join(__basedir, 'public/files')
const images = path.join(filePath, 'images')
const pdfPath = path.join(filePath, 'pdfs')

// const svgSize = 31
const svgSize = 31
const pageWidth = 595
const finalSizeRatio = 0.5

const scale = (pageWidth / svgSize) * finalSizeRatio

var baseURL = process.env.BASE_URL

module.exports = {
  async createImages(runnerInfo, force = false) {
    let runners = runnerInfo.runners

    for (let runner of runners) {
      let filename = path.join(images, `${runnerInfo.raceID}_${runner._id}.svg`)
      if (!fs.existsSync(filename) || force) {
        await this.deleteRacePDFFiles(runnerInfo.raceID)
        let qrURL = `${baseURL}/checkin/race/${runnerInfo.raceID}/runner/${runner._id}`
        let outputStream = fs.createWriteStream(filename)
        await new Promise((resolve, reject) => {
          outputStream.on('finish', () => {
            resolve()
          })
          qr.image(qrURL, { type: 'svg', size: 5 }).pipe(outputStream)
        })

      }
    }
  },

  async createPDFs(runnerInfo, force = false) {
    for (let classGroup of runnerInfo.runnersByClass) {
      await this.createClassPdf(classGroup, runnerInfo.raceID, force)
    }

    await this.createAllRunnersPdf(runnerInfo.runners, runnerInfo.raceID, force)
  },

  async deleteRacePDFFiles(raceID) {
    const filenames = fs.readdirSync(pdfPath)
    const fileRegex = new RegExp(`${raceID}.pdf`)

    filenames.forEach(function(filename) {
      const matches = fileRegex.exec(filename)
      if (!matches) {
        return
      }
      fs.unlinkSync(path.join(pdfPath, filename))
    })
  },
  createClassPdf: async function(classGroup, raceID, force) {

    let filename = `${classGroup.name}_${raceID}.pdf`
    let classPdfFilePath = path.join(pdfPath, filename)
    let generateTime = moment().toISOString()

    if (!fs.existsSync(classPdfFilePath) || force) {
      let doc = new PDFDocument(
        {
          size: 'A4',
          layout: 'portrait'
        })
      let writeStream = fs.createWriteStream(classPdfFilePath)
      doc.pipe(writeStream)

      for (let runner of classGroup.runners) {
        await this.addPDFPage(runner, raceID, doc, generateTime)
      }
      doc.end()

      return new Promise((resolve, reject) => {

        writeStream.on('finish', () => {
          console.log(filename)
          resolve()
        })

      })

    }

  },
  createAllRunnersPdf: async function(runners, raceID, force) {
    let pdfPath = path.join(filePath, 'pdfs')
    let filename = `allrunners_${raceID}.pdf`
    let allRunnersPdfFilePath = path.join(pdfPath, filename)
    let generateTime = moment().toISOString()

    if (!fs.existsSync(allRunnersPdfFilePath) || force) {

      let allRunnersDoc = new PDFDocument(
        {
          size: 'A4',
          layout: 'portrait'
        })

      let writeStream = fs.createWriteStream(allRunnersPdfFilePath)
      allRunnersDoc.pipe(writeStream)

      for (let runner of runners) {
        await this.addPDFPage(runner, raceID, allRunnersDoc, generateTime)
      }

      allRunnersDoc.end()

      return new Promise((resolve, reject) => {

        writeStream.on('finish', () => {
          console.log(filename)
          resolve()
        })

      })
    }

  },
  addPDFPage: async function(runner, raceID, doc, generateTime) {
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
      .text(`${runner.name}`,
        {
          align: 'center'
        })
      .moveDown()
    doc.fontSize(25)
      .text(`${runner.class}`,
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
}
