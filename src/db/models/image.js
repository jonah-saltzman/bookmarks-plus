const mongoose = require('mongoose')

const Schema = mongoose.Schema

const downloadImage = require('../../filedownload')

const ImageSchema = new Schema({
	media_key: {
		type: String,
		required: true,
	},
    url: {
        type: String,
        required: true
    },
	type: {
		type: String,
		required: true,
	},
    data: {
        type: Buffer,
        required: false
    },
    exists: {
        type: Boolean,
        required: false
    }
})

ImageSchema.methods.download = async function (){
    if (this.data && this.exists) {
        return
    }
    downloadImage(this.url, (err, buffer) => {
        if (err) {
            console.error(err)
            this.exists = false
            this.data = null
            this.save()
        } else if (buffer) {
            this.exists = true
            this.data = buffer
            this.save()
            console.log('added buffer size ', this.data.length, ' for ', this.media_key)
        }
    })
}

ImageSchema.methods.getBuffer = async function() {
    if (!this.data || !this.exists) {
        return false
    }
    return this.data
}

const Image = mongoose.model('Image', ImageSchema)

module.exports = Image
