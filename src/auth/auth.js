const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const JWTstrategy = require('passport-jwt').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../db/models/user')
const { randomBytes } = require('crypto')

const {
	JWT_SECRET,
	TWT_KEY: TWITTER_CONSUMER_KEY,
	TWT_SECRET: TWITTER_CONSUMER_SECRET
} = process.env

// Local registration
passport.use(
    'signup', 
    new localStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, 
    async (req, email, password, done) => {
        try {
            const userCheck = await User.findOne({ email: email })
            if (userCheck) {
                return done(null, false, {message: 'Email already exists'})
            }
            const user = await User.create({
                email: email,
                password: password
            })
            return done(null, user)
        } catch(error) {
            console.error(error)
            return done(error)
        }
    }
))

// Local login
passport.use(
    'login', 
    new localStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email })
            if (!user) {
                return done(
                    null,
                    false,
                    { status: 404, message: 'User not found'}
                )
            }
            const validPassword = await user.isValidPassword(password)
            if (!validPassword) {
                return done(
                    null,
                    false,
                    { status: 401, message: 'Invalid password'}
                )
            }
            return done(
                null,
                user,
                {status: 200, message: 'Logged in!'}
            )
        } catch(error) {
            return done(error)
        }
    }
))

passport.use(
    new JWTstrategy(
        {
            secretOrKey: JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT')
        },
        (token, done) => {
            console.log('in JWT strategy')
            console.log(token)
            if (!token) {
                return done(
                            {
                                status: 401,
                                error: { message: 'Invalid login session' }
                            }
                        )
            }
            User.findOne({_id: token.user._id}, (err, user) => {
                if (err) {
                    console.error(err)
                    return done(
                                {
                                    status: 500,
                                    error: { message: 'User database encountered an error' },
                                }
                            )
                }
                if (user) {
                    const internalTokenId = token.user.tokenId
                    const dbTokenId = user.tokenId
                    if (dbTokenId === internalTokenId) {
                        return done(null, user)
                    } else if (user.invalidTokenIds.some(id => id === internalTokenId)) {
                        return done(
                            {
                                status: 403,
                                error: { message: "Login session no longer valid" }
                            }
                        )
                    } else {
                        return done(
                            {
                                status: 406,
                                error: { message: "Invalid token" }
                            }
                        )
                    }
                } else {
                    console.error(new Error('unknown error'))
                    return done(null, false)
                }
            })
        }
    )
)

// passport.use(
// 	new TwitterStrategy(
// 		{
// 			consumerKey: TWITTER_CONSUMER_KEY,
// 			consumerSecret: TWITTER_CONSUMER_SECRET,
// 			callbackURL: TWT_LOGIN_CB_URL,
// 		},
// 		async function (token, tokenSecret, profile, cb) {
// 			const user = await User.findOne( {"twtAuth.twtId": profile.id} )
// 			if (user) {
// 				//user.twtAuth = twtAuth
// 				await user.save()
// 				return cb(null, user)
// 			}
// 			const newUser = await User.create({
// 				twtId: profile.id,
// 				twtAuth: twtAuth,
//                 email: randomBytes(8).toString('hex')
// 			})
// 			if (newUser) {
// 				console.log('created new user')
// 				return cb(null, newUser)
// 			}
// 			console.log('UNKNOWN ERROR')
// 			return cb({ error: 'Unknown error' }, null)
// 		}
// 	)
// )

const changePassword = async (user, oldPass, newPass, done) => {
    if (!user.password) {
        return done({status: 405, error: {message: 'Invalid account type'}})
    }
    const valid = await user.isValidPassword(oldPass)
    if (!valid) {
        return done({status: 401, error: {message: 'Invalid password'}})
    }
    if (valid) {
        const changed = await user.updatePassword(newPass)
        return changed
            ? done(null, {status: 204})
            : done({status: 500, error: {message: 'Failed to change password'}})
    }
}

module.exports = changePassword