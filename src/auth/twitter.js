const fetch = require('node-fetch')
const User = require('../db/models/user')
const { Headers } = require('node-fetch')
const { TWT_CLIENT_ID, TWT_AUTH_URL, TWT_CB_URL, CLOSE_URL } =
	process.env
const sendResponse = require('../responder')
const addToken = require('./addToken')
const getUser = require('../twt-api/me')
const { performTwitterLogin } = require('../db/twitter')
const Login = require('../db/models/login')

const twtAuth = async (req, res) => {
	if (req.query.error === 'access_denied') {
		return sendResponse(req, res, null, null, CLOSE_URL)
	}
	const twtCode = req.query.code || null
	const twtState = req.query.state || null
	const data = req.query.data || null
	const [type, userId] = data.split('.')
	if (!twtCode || !twtState || !data) {
		return sendResponse(req, res, {status: 400, error: {message: 'Missing url parameters'}})
	}
	let challenge = null
	let dbObject = null
	if (type === 'auth' && userId !== 'null') {
		const user = await User.findById(userId)
		challenge = user?.twtChallenge?.challenge
		dbObject = user
	} else if (type === 'login') {
		const dbLogin = await Login.findOne({ loginState: twtState })
		challenge = dbLogin?.loginChallenge?.challenge
		dbObject = dbLogin
	}
	if (!challenge) {
		return sendResponse(req, res, {status: 500, error: {message: 'Database error'}})
	}
	const reqDetails = {
		code: `${twtCode}`,
		grant_type: 'authorization_code',
		client_id: `${TWT_CLIENT_ID}`,
		redirect_uri: TWT_CB_URL + data,
		code_verifier: `${challenge}`,
	}
	const request = 
		Object.entries(reqDetails)
		.map(([key, value]) => key + '=' + value)
		.join('&')
	const response = await fetch(TWT_AUTH_URL, {
					method: 'POST',
					headers: new Headers({
						'Content-Type': 'application/x-www-form-urlencoded',
					}),
					body: request,
				})
	console.log(`response status: ${response.status}`)
	if (response.status !== 200) {
		return sendResponse(req, res, {status: 500, error: {message: 'Twitter API error'}})
	}
	const responseData = await response.json()
	console.log(responseData)
	const userData = await getUser(responseData.access_token)
	if (type === 'auth') {
		const date = new Date()
		date.setMinutes(date.getMinutes() + 115)
		dbObject.twtProfile = {
			token: responseData.access_token,
			tokenExp: date,
			twtState: twtState,
		}
		dbObject.twtId = userData.data.id
		dbObject.save()
		console.log('logged in user with state: ')
		console.log(twtState)
		return sendResponse(req, res, null, null, CLOSE_URL)
	}
	performTwitterLogin(
		userData.data,
		responseData,
		twtState,
		(err, user) => {
			if (err) {
				sendResponse(req, res, err)
			}
			if (user) {
				addToken(req, res, null, user, { twt: true })
			}
		}
	)
}

const refreshTwitter = async (req, res) => {
	const reqDetails = {
		refresh_token: req.userObj.twtAuth.refreshToken,
		grant_type: 'refresh_token',
		client_id: `${TWT_CLIENT_ID}`
	}
	const request = Object.entries(reqDetails)
		.map(([key, value]) => key + '=' + value)
		.join('&')
	const response = await fetch(TWT_AUTH_URL, {
		method: 'POST',
		headers: new Headers({
			'Content-Type': 'application/x-www-form-urlencoded',
		}),
		body: request,
	})
	console.log(`response status: ${response.status}`)
	if (response.status !== 200) {
		return false
	}
	const responseData = await response.json()
	const date = new Date()
	date.setMinutes(date.getMinutes() + 115)
	const twtProfile = {
		token: responseData.access_token,
		tokenExp: date,
		twtState: req.userObj.twtProfile.twtState,
	}
	req.userObj.twtProfile = twtProfile
	await req.userObj.save()
	return true
}

module.exports = { 
	twtAuth,
	refreshTwitter
}