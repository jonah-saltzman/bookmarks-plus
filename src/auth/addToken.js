const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env
const sendResponse = require('../sendresponse')

async function addToken(req, res, err, user, info) {
	const body = {
		_id: user._id,
		email: user.email,
        tokenCreated: new Date()
	}
	const token = jwt.sign({ user: body }, JWT_SECRET)
    sendResponse(req, res, null, {
        status: 200,
        message: {token: token}
    })
}

module.exports = addToken
