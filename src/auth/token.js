const passport = require('passport')

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

module.exports = checkToken