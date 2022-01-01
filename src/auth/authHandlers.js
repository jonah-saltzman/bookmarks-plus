const passport = require('passport')
const sendResponse = require('../responder')
const addToken = require('./addToken')

function handleLogin(req, res) {
    console.log('received client state: ')
    console.log(req.body.twtState)
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
            req.login(user, {session: false}, async (err) => {
                if (err) {
                    return sendResponse(req, res, {
                        status: 500,
                        message: "Error logging in",
                    })
                }
                const newState = await user.addState(req.body.twtState)
                if (newState === req.body.twtState) {
                    console.log('updated state on non-twt login')
                    return addToken(req, res, null, user, { twt: false })
                } else {
                    return sendResponse(req, res, {
                        status: 500,
                        message: "Error updating state",
                    })
                }
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
    handleSignup,
}