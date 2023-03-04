const mongoose = require('mongoose')
const mongoose_timestamp = require('mongoose-timestamp')

const Schema = new mongoose.Schema({
  userId: { type: mongoose.SchemaTypes.Number, required: true }, 
  title: { type: mongoose.SchemaTypes.String, required: true },
  date: { type : mongoose.SchemaTypes.String, required: true },
  desc: { type: mongoose.SchemaTypes.String, default: null },
  rating: { type : mongoose.SchemaTypes.Number, default: null },
})
Schema.plugin(mongoose_timestamp)

module.exports = mongoose.model('my-movie', Schema)