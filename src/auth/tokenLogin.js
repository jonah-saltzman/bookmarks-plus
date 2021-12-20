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
                    error: {
                        loggedIn: false,
                        message: "Database error"
                    }
                })
            }
            if (!user) {
                return sendResponse(req, res, {
                    status: info.status || 500,
                    error: {
                        loggedIn: false,
                        message: info.message,
                    }
                })
            }
            req.login(user, {session: false}, (err) => {
                if (err) {
                    return sendResponse(req, res, {
                        status: 500,
                        error: {
                            loggedIn: false,
                            message: "Error logging in"}
                    })
                }
                addToken(req, res, null, user)
            })
        }
    )(req, res)
}

module.exports = handleLogin