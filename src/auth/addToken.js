const jwt = require('jsonwebtoken')
const { JWT_SECRET, TOKEN_URL } = process.env
const sendResponse = require('../responder')

async function addToken(req, res, err, user, {twt}) {
    const tokenBody = {
			tokenId: await user.newToken(),
			_id: user._id,
			tokenCreated: new Date(),
		}
    if (twt) {
        tokenBody.twtId = user.twtId
    } else {
        tokenBody.email = user.email
    }
	const token = jwt.sign({ user: tokenBody }, JWT_SECRET)
    if (twt) {
        const redirect = TOKEN_URL + token
        return sendResponse(req, res, null, null, redirect)
    }
    const twtChallenge = await user.newChallenge()
    sendResponse(req, res, null, {
        status: 200,
        response: {
            message: `${user.email || user.twtProfile.data.displayName} signed in!`,
            userId: user._id.toString(),
            token: token,
            twtChallenge: twtChallenge,
            twtAuth: twt
        }
    })
}

module.exports = addToken
