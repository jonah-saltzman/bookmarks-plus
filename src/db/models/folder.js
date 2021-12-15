const mongoose = require('mongoose')

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
    }]
})

FolderSchema.methods.getFolderTweets = async function() {
    return this.populate('tweets').tweets.map(tweet => {
        return {
					twtId: tweet.twtId,
                    media: tweet.twtMedia.map(media => media.url)
				}
    })
}

const Folder = mongoose.model('Folder', FolderSchema)

module.exports = Folder