const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MediaSchema = new Schema({
	key: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
})

module.exports = MediaSchema
