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
        return true
    }
    const data = await downloadImage(this.url)
    this.exists = data ? true : false
    this.data = data ? data : null
    await this.save()
    return this.exists
}

ImageSchema.methods.getBuffer = function() {
    if (!this.data || !this.exists) {
        return false
    }
    return this.data
}

const Image = mongoose.model('Image', ImageSchema)

module.exports = Image
