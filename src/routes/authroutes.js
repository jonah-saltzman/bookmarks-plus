const express = require('express')
const router = express.Router()
const passport = require('passport')
const addToken = require('../auth/addToken')
const handleLogin = require('../auth/tokenLogin')

// Errors during registration handled within Passport strategy
router.post(
	'/signup',
	passport.authenticate('signup', {session: false}),
	async (req, res) => {
		res.json({
			registered: true,
			user: req.user,
		})
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