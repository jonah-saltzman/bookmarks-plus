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
    const result = await downloadImage(this.url)
    if (result) {
        this.exists = true
        this.data = result
        await this.save()
        console.log('image downloaded, returning true')
        return true
    } else {
        this.exists = false
        this.data = null
        await this.save()
        console.log('download failed, returning false')
        return false
    }
}

ImageSchema.methods.getBuffer = async function() {
    if (!this.data || !this.exists) {
        return false
    }
    return this.data
}

const Image = mongoose.model('Image', ImageSchema)

module.exports = Image
