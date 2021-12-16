const express = require('express')
const router = express.Router()
const passport = require('passport')

const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env

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
    async (req, res, next) => {
        passport.authenticate(
            'login',
            { session: false },
            async (err, user, info) => {
                try {
                    if (err) {
                        res.status(500)
                        return res.json({message: 'Unknown server error'})
                    }
                    if (!user) {
                        res.status(401)
                        return res.json(info)
                    }
                    // Upon validation of login credentials, req.login adds user
                    // object to req object, then callback generates JWT and sends
                    // token to client in response body
                    req.login(
                        user,
                        { session: false },
                        async (err) => {
                            if (err) {
                                return next(new Error('req.login error'))
                            }
                            const body = {
                                _id: user._id,
                                email: user.email
                            }
                            const token = jwt.sign({ user: body }, JWT_SECRET)
                            return res.json({ token: 'JWT ' + token })
                        }
                    )
                } catch(error) {
                    return next(new Error('unknown error'))
                }
            }
        )(req, res, next)
    }
)

module.exports = router