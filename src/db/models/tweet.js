const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MediaSchema = require('./twtmedia')
const Folder = require('./folder')

const TweetSchema = new Schema({
	twtId: {
		type: String,
		required: true,
		unique: true,
	},
	folders: [{
		type: Schema.Types.ObjectId,
        ref: 'Folder',
		required: false,
	}],
	twtMetrics: {
        type: Object,
        required: true
    },
    twtDate: {
        type: String,
        required: true
    },
    twtText: {
        type: String,
        required: true
    },
    twtAuthor: {
        type: Object,
        required: true
    },
    twtMedia: [MediaSchema]
})

const Tweet = mongoose.model('Tweet', TweetSchema)

module.exports = Tweet
