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
                })
            }
            if (!user) {
                return sendResponse(req, res, {
                    status: info.status || 500,
                    message: info.message,
                })
            }
            req.login(user, {session: false}, (err) => {
                if (err) {
                    return sendResponse(req, res, {
                        status: 500,
                        message: "Error logging in",
                    })
                }
                addToken(req, res, null, user, { twt: false })
            })
        }
    )(req, res)
}

function handleSignup(req, res) {
    passport.authenticate(
        'signup',
        { session: false },
        (err, user, info) => {
            if (err) {
                return sendResponse(req, res, {
                    status: 500,
                    message: "Database error",
                })
            }
            if (!user) {
                return sendResponse(req, res, {
                    status: 409,
                    message: "Account already exists"
                })
            }
            return sendResponse(req, res, null, {
                status: 200,
                response: {
                    message: `Account created for ${req.body.email}`
                }
            })
    })(req, res)
}

module.exports = { 
    handleLogin,
    handleSignup
}