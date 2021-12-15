const express = require('express')
const router = express.Router()
const passport = require('passport')

const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env

router.post(
	'/signup',
	passport.authenticate('signup', {session: false}),
	async (req, res) => {
		console.log('passed passport')
		console.log(req.body)
		res.json({
			registered: true,
			user: req.user,
		})
	}
)

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