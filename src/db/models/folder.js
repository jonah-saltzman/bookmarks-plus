const mongoose = require('mongoose')
const Str = require('@supercharge/strings')

const Schema = mongoose.Schema

const FolderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    folderName: {
        type: String,
        required: true
    },
    tweets: [{
        type: Schema.Types.ObjectId,
        ref: 'Tweet',
        required: false
    }],
    shared: {
        type: Boolean,
        required: true,
    },
    url: {
        type: String,
        required: false
    }
})

FolderSchema.pre('save', async function(next) {
    if (!('shared' in this)) {
        this.shared = false
    }
    next()
})

FolderSchema.methods.setShared = async function (value) {
    this.shared = value || false
    if (value) {
        this.url = Str.random(15)
    }
    await this.save()
    return value ? this.url : false
}

FolderSchema.methods.getFolderTweets = async function() {
    return await this.populate('tweets').tweets.map(tweet => {
        return {
					twtId: tweet.twtId,
                    media: tweet.twtMedia.map(media => media.url)
				}
    })
}

const Folder = mongoose.model('Folder', FolderSchema)

module.exports = Folder