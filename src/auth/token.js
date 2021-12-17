const passport = require('passport')
const { sendResponse } = require('../middleware')

const checkToken = async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, user) => {
            if (err) {
                return sendResponse(req, res, err)
            }
            if (!user) {
                const errObj = {status: 405, error: {message: "Token does not match any user"}}
                return sendResponse(req, res, errObj)
            }
            req.userObj = user
            next()
        })(req, res, next)
}

const invalidateToken = async (userObj, done) => {
    const currentToken = userObj.getCurrentToken()
    const invalidToken = await userObj.invalidateToken()
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