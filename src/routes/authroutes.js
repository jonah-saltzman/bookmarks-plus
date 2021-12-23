const express = require('express')
const router = express.Router()
const { handleLogin, handleSignup } = require('../auth/authHandlers')

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

module.exports = router