const mongoose = require('mongoose')
const mongoose_timestamp = require('mongoose-timestamp')

const Schema = new mongoose.Schema({
    authId: { type: mongoose.SchemaTypes.String, default: null },
    email: { type: mongoose.SchemaTypes.String, required: true }, 
    name: { type: mongoose.SchemaTypes.String, required: true },
    nickName: { type: mongoose.SchemaTypes.String, required: true },
    picture: { type : mongoose.SchemaTypes.String, required: true }, //기본이미지 넣어놓기
})
Schema.plugin(mongoose_timestamp)

module.exports = mongoose.model('user', Schema)