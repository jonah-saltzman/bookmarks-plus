const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env
const sendResponse = require('../responder')

async function addToken(req, res, err, user, info) {
	const tokenBody = {
        tokenId: await user.newToken(),
		_id: user._id,
		email: user.email,
        tokenCreated: new Date()
	}
	const token = jwt.sign({ user: tokenBody }, JWT_SECRET)
    sendResponse(req, res, null, {
        status: 200,
        response: {
            message: `${user.email} signed in!`,
            userId: user._id.toString(),
            token: token
        }
    })
}

module.exports = addToken
