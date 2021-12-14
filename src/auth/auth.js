const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const User = require('../db/models/user')

// Local registration
passport.use('signup', new localStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, 
    async (req, email, password, done) => {
        try {
            const user = await User.create({
                email: email,
                password: password,
                twtId: req.body.twtId
            })
            console.log(user)
            return done(null, user)
        } catch(error) {
            console.error(error)
            done(error)
        }
    }
))

// Local login
passport.use('login', new localStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({email: email})
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