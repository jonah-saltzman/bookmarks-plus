const fetch = require('node-fetch')
const mongoose = require('mongoose')
const User = require('../db/models/user')
const { Headers } = require('node-fetch')
const { JWT_SECRET, TWT_CLIENT_ID, TWT_CHALLENGE } = process.env
const twtAuthUrl = 'https://api.twitter.com/2/oauth2/token'
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
				redirect_uri: `http://127.0.0.1:4000/twtauth?user=${userId}`,
				code_verifier: `${TWT_CHALLENGE}`,
			}
			console.log('making request: ')
			console.log(reqDetails)
			const reqArray = []
			for (const key in reqDetails) {
				reqArray.push(key + '=' + reqDetails[key])
			}
			const reqBody = reqArray.join('&')
			const response = await fetch(twtAuthUrl, {
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
					user.twtProfile = {
						token: data.access_token,
					}
					await user.save()
					console.log(`new access token: `)
					console.log(data.access_token)
					res.status(200)
					return res.redirect('http://localhost:3000/better-bookmarks/close')
					return res.json({
						message: `Successfully twitter authed user ${user.email}`,
					})
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
