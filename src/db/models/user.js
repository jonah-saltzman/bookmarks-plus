const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema
const pkceChallenge = require('pkce-challenge')
const Folder = require('./folder')
const { v4: uuidv4 } = require('uuid')
const { randomBytes } = require('crypto')

const UserSchema = new Schema(
    {
        email: {
            type: String,
            required: false,
            unique: true,
        },
        password: {
            type: String,
            required: false,
        },
        twtId: {
            type: String,
            required: false,
            unique: true,
        },
        folders: [{
            type: Schema.Types.ObjectId,
            ref: 'Folder',
            required: false
        }],
        tokenId: {
            type: String,
            required: false
        },
        invalidTokenIds: [{
            type: String,
            required: false
        }],
        twtProfile: {
            type: Object,
            required: false
        },
        twtChallenge: {
            type: Object,
            required: false
        },
        twtAuth: {
            type: Object,
            required: false
        }
    },
    {
		timestamps: true,
		toObject: {
			transform: (_doc, user) => {
				delete user.password
                if (user.tokenId) {
                    delete user.tokenId
                }
                if (user.invalidTokenIds) {
                    delete user.invalidTokenIds
                }
				return user
			},
		},
	}
)

UserSchema.pre('save', async function(next) {
    if (this.modifiedPaths().some(path => path === 'password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    if (!this.twtChallenge) {
        const newChallenge = pkceChallenge(43)
        this.twtChallenge = {
            challenge: newChallenge.code_challenge,
            verifier: newChallenge.code_verifier,
        }
    }
    next()
})

UserSchema.methods.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.createFolder = async function(folderName) {
    const folder = await Folder.create({
        user: this._id,
        folderName: folderName,
        shared: false,
    })
    if (this.folders) {
        this.folders.push(folder._id)
    } else {
        this.folders = [folder._id]
    }
    await this.save()
    if (this.folders.some(userFolder => userFolder._id === folder._id)) {
        return true
    } else {
        return false
    }
}

UserSchema.methods.newToken = async function() {
    const newId = uuidv4()
    if (this.tokenId) {
        this.invalidTokenIds.push(this.tokenId)
    }
    this.tokenId = newId
    await this.save()
    return this.tokenId
}

UserSchema.methods.newChallenge = async function() {
    const newChallenge = pkceChallenge(43)
    this.twtChallenge = {
			challenge: newChallenge.code_challenge,
			verifier: newChallenge.code_verifier,
		}
    await this.save()
    return this.twtChallenge.challenge
}

UserSchema.methods.invalidateToken = async function() {
    if (!this.tokenId) {
        return false
    }
    this.invalidTokenIds.unshift(this.tokenId)
    this.tokenId = null
    await this.save()
    return this.invalidTokenIds[0]
}

UserSchema.methods.getCurrentToken = function() {
    return this.tokenId
}

UserSchema.methods.updatePassword = async function(newPassword) {
    const oldHash = this.password
    this.password = newPassword
    await this.save()
    return oldHash !== this.password
}

UserSchema.methods.addState = async function(newState) {
    this.twtProfile = {...this.twtProfile, twtState: newState}
    await this.save()
    return this.twtProfile.twtState
}

const User = mongoose.model('User', UserSchema)

module.exports = User
