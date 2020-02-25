var moment = require('moment')
const RaceModel = require('../models/Race')
const RunnerModel = require('../models/Runner')
const CheckinModel = require('../models/Checkin')

var baseURL = process.env.BASE_URL

class RunnerInfo {

  constructor() {

    this.runners = []
    this.runnersByClass = []
    this.timingTags = []
    this.initilized = false
    this.raceID = null
  }

  async updateForRaceID(raceID, force = false) {
    if (this.raceID && this.raceID === raceID && !force) { return }

    this.raceID = raceID
    this.race = await RaceModel.findById(this.raceID)
    this.runners = await RunnerModel.find()
    this.tags = await CheckinModel.find({ race: this.raceID })

    this.runners.forEach(v => {
      v.imageURL = `${baseURL}/files/images/${this.raceID}_${v._id}.svg`
      v.tags = this.tags.filter(t => t.runner._id.equals(v._id)).sort((a, b) => a.time - b.time)
      if (v.tags.length === 0) {
        v.status = 'Not Started'
      } else if (v.tags.length === 1) {
        v.status = 'Running'
        v.startTime = moment(v.tags[0].time).format('LTS')
      } else if (v.tags.length === 2) {
        v.status = 'Complete'
        let start = moment(v.tags[0].time)
        let end = moment(v.tags[1].time)
        let duration = moment.duration(end.diff(start))
        v.timeMilli = duration.asMilliseconds()
        v.startTime = start.format('LTS')
        v.endTime = end.format('LTS')
        v.duration = duration.minutes() + ':' + duration.seconds() + '.' + duration.milliseconds()
      } else if (v.tags.length > 2) {
        v.status = 'Error'
      }
    })

    this.classes = this.runners.map(v => v.class).filter((elem, pos, arr) => arr.indexOf(elem) === pos)
    this.allRunnerPDF = `${baseURL}/files/pdfs/allrunners_${this.raceID}.pdf`
    this.runnersByClass = this.classes.map(v => {
      return {
        name: v,
        classPDF: `${baseURL}/files/pdfs/${v}_${this.raceID}.pdf`,
        runners: this.runners.filter(r => r.class === v).sort().sort((a, b) => a.name.localeCompare(b.name))
      }
    })

    this.runnersByClass.sort((a, b) => a.name.localeCompare(b.name))
  }

}

module.exports = new RunnerInfo()