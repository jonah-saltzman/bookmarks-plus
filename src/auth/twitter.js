const fetch = require('node-fetch')
const mongoose = require('mongoose')
const User = require('../db/models/user')
const { Headers } = require('node-fetch')
const { TWT_CLIENT_ID, TWT_CHALLENGE, TWT_AUTH_URL, TWT_CB_URL, CLOSE_URL } =
	process.env
const sendResponse = require('../responder')

const twtAuth = async (req, res) => {
	console.log('received credentials from twitter:')
	const twtCode = req.query.code || null
	const userId = req.query.user || null
	console.log(`user: ${userId}`)
	console.log(`code: ${twtCode}`)
	if (twtCode && userId) {
		const objId = new mongoose.Types.ObjectId(userId)
		const user = await User.findById(userId)
		if (user) {
			const reqDetails = {
				code: `${twtCode}`,
				grant_type: 'authorization_code',
				client_id: `${TWT_CLIENT_ID}`,
				redirect_uri: TWT_CB_URL + userId,
				code_verifier: `${TWT_CHALLENGE}`,
			}
			console.log('making request: ')
			console.log(reqDetails)
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
						tokenExp: date
					}
					await user.save()
					console.log(`new access token: `)
					console.log(data.access_token)
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

module.exports = twtAuth
