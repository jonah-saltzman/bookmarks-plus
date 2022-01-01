const fetch = require('node-fetch')
const User = require('../db/models/user')
const { Headers } = require('node-fetch')
const passport = require('passport')
const { TWT_CLIENT_ID, TWT_AUTH_URL, TWT_CB_URL, CLOSE_URL } =
	process.env
const sendResponse = require('../responder')
const addToken = require('./addToken')
const getUser = require('../twt-api/me')

passport.serializeUser(function (user, done) {
	console.log('serializing user')

	done(null, user)
})

passport.deserializeUser(function (user, done) {
	console.log('deserializing user')
	done(null, user)
})

const twtAuth = async (req, res) => {
	if (req.query.error === 'access_denied') {
		return res.redirect(CLOSE_URL)
	}
	const twtCode = req.query.code || null
	const userId = req.query.user || null
	const twtState = req.query.state || null
	if (twtCode && userId) {
		const user = await User.findById(userId)
		if (user) {
			const reqDetails = {
				code: `${twtCode}`,
				grant_type: 'authorization_code',
				client_id: `${TWT_CLIENT_ID}`,
				redirect_uri: TWT_CB_URL + userId,
				code_verifier: `${user.twtChallenge.challenge}`,
			}
			const reqArray = []
			for (const key in reqDetails) {
				reqArray.push(key + '=' + reqDetails[key])
			}
			const reqBody = reqArray.join('&')
			const response = await fetch(TWT_AUTH_URL, {
				method: 'POST',
				headers: new Headers({
					'Content-Type': 'application/x-www-form-urlencoded',
				}),
				body: reqBody,
			})
			const status = response.status
			console.log(`response status: ${status}`)
			if (status === 200) {
				const data = await response.json()
				if (data) {
					const date = new Date()
					date.setMinutes(date.getMinutes() + 115)
					user.twtProfile = {
						token: data.access_token,
						tokenExp: date,
						twtState: twtState
					}
					const twtUser = await getUser(user.twtProfile.token)
					user.twtId = twtUser
					if (user.twtAuth) {
						user.twtAuth.twtId = twtUser
					}
					await user.save()
					res.status(200)
					return res.redirect(CLOSE_URL)
				}
			} else {
				res.status(500)
				const data = await response.json()
				return res.json({ message: data })
			}
		}
		console.log('couldnt find user: ')
		console.log(userId)
		res.status(500)
		return res.json({ message: 'Didnt find user in db' })
	}
	console.log('missing params from twitter redirect:')
	console.log(req.query)
	res.status(500)
	return res.json({ message: 'Missing url params' })
}

const twtLogin = (req, res) => {
	passport.authenticate('twitter')(req, res)
}

const twtLoginCB = (req, res, next) => {
	passport.authenticate('twitter', { failureRedirect: '/' }, (err, user) => {
		console.log(`in /twtLoginCB, passport cb function`)
		if (user) {
			req.login(user, {session: false}, (err) => {
				if (err) {
					console.log('error!')
					console.log(err)
					return sendResponse(req, res, err)
				}
				addToken(req, res, null, user, {twt: true})
			})
		}
	})(req, res)
}

module.exports = { 
	twtAuth,
	twtLogin,
	twtLoginCB
}