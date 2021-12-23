const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const JWTstrategy = require('passport-jwt').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../db/models/user')

const { JWT_SECRET,
    TWT_CLIENT_ID,
    TWT_CLIENT_SECRET,
    TWT_CB_URL,
    TWT_KEY,
    TWT_SECRET
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
                password: password,
                twtId: req.body.twtId
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
                    console.log('in JWT strategy')
                    const internalTokenId = token.user.tokenId
                    const dbTokenId = user.tokenId
                    console.log(internalTokenId, dbTokenId)
                    console.log(user)
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
// 			consumerKey: TWT_KEY,
// 			consumerSecret: TWT_SECRET,
// 			callbackURL: TWT_CB_URL,
// 		},
// 		async function (token, tokenSecret, profile, done) {
//             console.log('in TWT strategy')
//             console.log('twt profile: ')
//             console.log(profile)
// 			User.findOne({ twtId: profile.id }, async (err, user) => {
//                 console.log('found user: ')
//                 console.log(user)
//                 if (user) {
//                     const update = {
//                         twtProfile: {
//                             profile: profile,
//                             token: token,
//                             tokenSecret: tokenSecret
//                         }
//                     }
//                     const newUser = await User.findByIdAndUpdate(
//                         user._id,
//                         update,
//                         {returnOriginal: false}
//                     )
//                     if (newUser.twtProfile.profile) {
//                         console.log('added twitter profile to user')
//                         return done(null, newUser, token, tokenSecret)
//                     } else {
//                         console.log('got twt tokens but failed to add to db')
//                         return done(null, null, null, null)
//                     }
//                 }
//                 console.log('could not find user linked to twt profile')
// 				return done(err)
// 			})
// 		}
// 	)
// )