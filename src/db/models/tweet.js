const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MediaSchema = require('./twtmedia')
const Image = require('./image')

const extRE = new RegExp(/(?:\/[a-zA-Z0-9_-]+\.)([a-zA-Z]+$)/i)

const TweetSchema = new Schema({
	twtId: {
		type: String,
		required: true,
		unique: true,
	},
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
    twtHtml: {
        type: String,
        required: false
    },
    twtMedia: [MediaSchema]
})

TweetSchema.methods.fetchImages = async function () {
    if (this.twtMedia && this.twtMedia?.length > 0) {
        const imageObjs = this.twtMedia.map(media => ({
					media_key: media.key,
					url: media.url,
					type: media.url.match(extRE)[1],
				}))
        const images = await Image.insertMany(imageObjs)
        console.log('inserted images into db')
        console.log(images)
        if (images) {
            const added = await Promise.all(images.map(image => image.download()))
            console.log('added array:')
            console.log(added)
            const success = added.every((result) => result === true)
            console.log(`success: `, success)
            return success || images.length === 0
        } else {
            return true
        }
    }
}

// for (const image of images) {
// 	image.exists = false
// 	image.download()
// }

const Tweet = mongoose.model('Tweet', TweetSchema)

module.exports = Tweet
