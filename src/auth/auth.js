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
        passReqToCallback: true
    },
    async (req, email, password, done) => {
        //console.log(req)
        try {
            const user = await User.findOne({ email })
            if (!user) {
                return done(null, false, {message: 'User not found'})
            }
            const validPassword = await user.isValidPassword(password)
            if (!validPassword) {
                return done(null, false, {message: 'Invalid password'})
            }
            return done(null, user, {message: 'Logged in!'})
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
            if (!token) {
                return done('bad token', false, {message: "token extraction failed"})
            }
            User.findOne({_id: token.user._id}, (err, user) => {
                if (err) {
                    console.error(err)
                    return done(err, false)
                }
                if (user) {
                    // console.log(user)
                    return done(null, user)
                }
                console.log('unknown error')
                return done(null, false)
            })
        }
    )
)