const passport = require('passport')
const sendResponse = require('../responder')

const twtAuth = async (req, res, next) => {
	passport.authenticate(
		'twitter',
		{ session: false },
		async (err, user, token, secret) => {
			if (err) {
				return sendResponse(req, res, err)
			}
			if (!user) {
				const errObj = {
					status: 405,
					error: { message: 'Matching TwtID not found' },
				}
				return sendResponse(req, res, errObj)
			}
            if (!token || !secret) {
                const errObj = {
					status: 503,
					error: { message: 'Problem with Twitter auth' },
				}
				return sendResponse(req, res, errObj)
            }
			req.userObj = user
            req.userObj.twtToken = token
            req.userObj.twtSecret = secret
			next()
		}
	)(req, res, next)
}

module.exports = twtAuth
