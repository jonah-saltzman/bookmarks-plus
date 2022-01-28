const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MediaSchema = require('./twtmedia')
const Image = require('./image')
const fetch = require('node-fetch')
const { Headers } = fetch

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
    console.log('AWS api key')
    console.log(process.env.AWS_API_KEY)
    console.log('AWS URL:')
    console.log(process.env.AWS_API_URL)
    if (this.twtMedia && this.twtMedia?.length > 0) {
        const imageObjs = this.twtMedia.map(media => ({
					media_key: media.key,
					url: media.url,
					type: media.url.match(extRE)[1],
                    inAWS: false
				}))
        const awsResponses = await Promise.all(imageObjs.map(async req => {
            const headers = new Headers({
                'Content-Type': 'application/json'
                // 'x-api-key': process.env.AWS_API_KEY
            })
            const reqObj = {
							method: 'PUT',
							body: JSON.stringify(req),
							headers: headers,
						}
            const response = await fetch(process.env.AWS_API_URL + '/', reqObj)
            const data = await response.json()
            console.log('aws response: ')
            console.log(JSON.parse(data.body))
            if (data.statusCode === 200) {
                console.log('AWS save successful')
                return {...req, inAWS: true}
            } else {
                console.log('AWS save failed')
                return req
            }
        }))
        const images = await Image.insertMany(awsResponses)
        if (images) {
            const added = await Promise.all(images.map(image => image.download()))
            const succeeded = added.every((result) => result === true)
            return succeeded || images.length === 0
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
