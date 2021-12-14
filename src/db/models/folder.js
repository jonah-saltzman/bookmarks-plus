const mongoose = require('mongoose')

const Schema = mongoose.Schema

const FolderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tweets: [{
        type: Schema.Types.ObjectId,
        ref: 'Tweet',
        required: false
    }]
})

const Folder = mongoose.model('Folder', FolderSchema)

module.exports = Folder