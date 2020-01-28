var dynamoFuncs = require('../lib/dynamo')
var _ = require('underscore')
var generator = require('../lib/qr-generator')
var async = require('async')
var moment = require('moment')
const RaceData = require('./RaceData')
var baseURL = process.env.BASE_URL

class RunnerInfo {

  constructor() {

    this.runners = []
    this.runnersByClass = []
    this.tabardFiles = []
    this.timingTags = []
    this.initilized = false
    this.raceID = null
  }

  async updateForRaceID(raceID, force = false) {
    if (this.raceID && this.raceID === raceID && !force) { return }

    this.raceID = raceID
    this.race = await RaceData.RaceModel.findById(this.raceID)
    this.runners = await RaceData.RunnerModel.find()
    this.tags = await RaceData.CheckinModel.find({ race: this.raceID })

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

        v.startTime = start.format('LTS')
        v.endTime = end.format('LTS')
        v.duration = duration.minutes() + ':' + duration.seconds() + '.' + duration.milliseconds()
      } else if (v.tags.length > 2) {
        v.status = 'Error'
      }
    })

    this.classes = this.runners.map(v => v.class).filter((elem, pos, arr) => arr.indexOf(elem) === pos)
    this.runnersByClass = this.classes.map(v => {
      return {
        name: v,
        runners: this.runners.filter(r => r.class === v).sort().sort((a, b) => a.name.localeCompare(b.name))
      }
    })
  }

}

module.exports = new RunnerInfo()