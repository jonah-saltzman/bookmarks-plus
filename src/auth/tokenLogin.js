const passport = require('passport')
const sendResponse = require('../responder')
const addToken = require('./addToken')

function handleLogin(req, res) {
	passport.authenticate(
        'login',
        { session: false },
        (err, user, info) => {
            if (err) {
                return sendResponse(req, res, {
                    status: 500,
                    message: "Database error",
                    token: null
                })
            }
            if (!user) {
                return sendResponse(req, res, {
                    status: info.status || 500,
                    message: info.message,
                    token: null
                })
            }
            req.login(user, {session: false}, (err) => {
                if (err) {
                    return sendResponse(req, res, {
                        status: 500,
                        message: "Error logging in",
                        token: null
                    })
                }
                addToken(req, res, null, user)
            })
        }
    )(req, res)
}

module.exports = handleLogin