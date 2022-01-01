const mongoose = require('mongoose')

const Schema = mongoose.Schema
const pkceChallenge = require('pkce-challenge')

const LoginSchema = new Schema(
	{
		loginState: {
			type: String,
			required: false,
		},
        loginChallenge: {
            type: Object,
            required: false
        }
	},
	{
		timestamps: true,
    }
)

LoginSchema.methods.newChallenge = async function () {
	const newChallenge = pkceChallenge(43)
	this.loginChallenge = {
		challenge: newChallenge.code_challenge,
		verifier: newChallenge.code_verifier,
	}
	await this.save()
	return this.loginChallenge.challenge
}

LoginSchema.methods.setState = async function (state) {
    this.loginState = state
    await this.save()
    return this.loginState
}

const Login = mongoose.model('Login', LoginSchema)

module.exports = Login
