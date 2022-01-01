const express = require('express')
const router = express.Router()
const { handleLogin, handleSignup } = require('../auth/authHandlers')
const { newTwtLogin } = require('../db/twitter')
const sendResponse = require('../responder')

// Errors during registration handled within Passport strategy
router.post(
	'/signup',
	(req, res) => {
		handleSignup(req, res)
	}
)

// Errors during signin handled in authentication IIFE
router.post(
    '/login',
    (req, res, next) => {
        handleLogin(req, res, next)
    }
)

router.post(
    '/twitter',
    (req, res) => {
        console.log('got request to /twitter')
        newTwtLogin(
            req.body.state,
            (err, response, redirect) => {
                sendResponse(req, res, err, response, redirect)
            }
        )
    }
)

module.exports = router