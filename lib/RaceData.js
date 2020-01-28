class RaceData {

  constructor() {

    this.RaceModel = require('../models/Race')
    this.RunnerModel = require('../models/Runner')
    this.CheckinModel = require('../models/Checkin')
  }

  async createRace(payload) {
    return this.RaceModel.create(payload)
  }

  async getRace(raceId) {
    if (raceId) {
      return this.RaceModel.findById(raceId)
    } else {
      return this.RaceModel.find()
    }
  }

  async updateRace(raceId, data) {
    return this.RaceModel.findByIdAndUpdate(raceId, data)
  }

  async deleteRace(raceId, data) {
    return this.RaceModel.findByIdAndDelete(raceId)
  }

}

module.exports = new RaceData()
