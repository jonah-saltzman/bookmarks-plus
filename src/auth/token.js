const passport = require('passport')
const { sendResponse } = require('../middleware')

const checkToken = async (req, res, next) => {
    console.log(`checking token on ${req.body}`)
    passport.authenticate('jwt', { session: false }, async (err, user) => {
            if (err) {
                return sendResponse(req, res, err)
            }
            if (!user) {
                const errObj = {status: 405, error: {message: "Token does not match any user"}}
                return sendResponse(req, res, errObj)
            }
            console.log(`token validation succeeded for ${user.email}`)
            req.userObj = user
            next()
        })(req, res, next)
}

const invalidateToken = async (userObj, done) => {
    console.log(`invalidating token on user ${userObj.email}`)
    const currentToken = userObj.getCurrentToken()
    const invalidToken = await userObj.invalidateToken()
    console.log(`after invalidating token, ${userObj.email}'s tokenId: ${userObj.tokenId}`)
    if (currentToken === invalidToken) {
        done(
                null,
                null,
                { path: '/' }
			)
    } else {
        done({
            status: 401,
            error: {
                signedOut: false,
                user: userObj.email,
                message: 'Provided token was not current'
            }
        }, null)
    }
}

module.exports = {
    checkToken,
    invalidateToken
}