var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))

async function startPDB() {
  var db = new PouchDB('./pouchdb/users')
  let ok = await db.createIndex({ index: { fields: ['username'] } })
  console.log('INDEX CREATED!')
  console.log(ok)
  let info = await db.info()
  console.log(info)

  let res = await db.people.find()
  console.log(res)
}

startPDB()