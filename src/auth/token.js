const passport = require('passport')
const jwt = require('jsonwebtoken')

const checkToken = async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, user) => {
            if (err) {
                console.error(err)
                res.status(500)
                return res.json({error: err})
            }
            if (!user) {
                console.error(new Error('token extraction failed'))
                res.status(500)
                return res.json({error: "token auth failed"})
            }
            req.userObj = user
            next()
        })(req, res, next)
}

const validateToken = async (req, res) => {
    jwt.verify(req.body.token, JWT_SECRET, (err, data) => {
		if (err) {
			res.status(500)
			return res.json({ 
				message: 'Token failed validation',
				token: req.body.token
			})
		}
		if (data) {
			res.status(200)
			return res.json({
				message: 'Token successfully validated',
				token: req.body.token,
				user: data
			})
		}
		res.status(500)
		return res.json({ message: 'Unknown server error' })
    })
}

module.exports = {
    checkToken,
    validateToken
}