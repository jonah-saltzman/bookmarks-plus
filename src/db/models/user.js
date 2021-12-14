const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema
const Folder = require('./folder')

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
    twtId: {
        type: String,
        required: false
    },
    folders: [{
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        required: false
    }]
})

UserSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

UserSchema.methods.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model('User', UserSchema)

module.exports = User
