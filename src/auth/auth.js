const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const JWTstrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../db/models/user')

const { JWT_SECRET } = process.env

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
                password: password,
                twtId: req.body.twtId
            })
            return done(null, user)
        } catch(error) {
            console.error(error)
            done(error)
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
            console.log(`checking password for user: ${email}`)
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
            console.log('IN TOKEN STRATEGY')
            console.log(token)
            console.log(`tokenID: ${token.user.tokenId}`)
            if (!token) {
                return done(
                            {
                                status: 401,
                                error: { message: 'Invalid login session' }
                            }
                        )
            }
            const internalTokenId = token.user.tokenId
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
                    const dbTokenId = user.tokenId
                    console.log(`token matches user: ${user.email}`)
                    console.log(`user's current tokenId: ${user.tokenId}`)
                    if (dbTokenId === internalTokenId) {
                        console.log('TokenId matches ID in db')
                        return done(null, user)
                    } else if (user.invalidTokenIds.some(id => id === internalTokenId)) {
                        console.log('found expired/invalid ID')
                        return done(
                            {
                                status: 403,
                                error: { message: "Login session no longer valid" }
                            }
                        )
                    }
                } else {
                    console.log('unknown error')
                    return done(null, false)
                }
            })
        }
    )
)