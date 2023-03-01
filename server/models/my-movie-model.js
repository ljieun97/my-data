const mongoose = require('mongoose')
const mongoose_timestamp = require('mongoose-timestamp')

const Schema = new mongoose.Schema({
  userId: { type: mongoose.SchemaTypes.Number, required: true }, 
  movieInfo: { type: mongoose.SchemaTypes.Mixed, required: true },
  myInfo: { type : mongoose.SchemaTypes.Mixed, default: null },
})
Schema.plugin(mongoose_timestamp)

module.exports = mongoose.model('my-movie', Schema)