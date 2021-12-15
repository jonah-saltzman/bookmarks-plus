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
                console.log(err, user, info)
                try {
                    if (err) {
                        console.error(err)
                        res.status(500)
                        return res.json({message: 'Unknown server error'})
                    }
                    if (!user) {
                        console.log('user does not exist')
                        res.status(401)
                        return res.json(info)
                    }
                    console.log('got past err/!user')
                    req.login(
                        user,
                        { session: false },
                        async (err) => {
                            if (err) {
                                console.log('req.login error')
                                return next(new Error('req.login error'))
                            }
                            const body = {
                                _id: user._id,
                                email: user.email
                            }
                            const token = jwt.sign({ user: body }, JWT_SECRET)
                            console.log(`token: `, token)
                            return res.json({ token })
                        }
                    )
                } catch(error) {
                    console.log('caught error')
                    return next(new Error('unknown error'))
                }
            }
        )(req, res, next)
    },
    async (req, res) => {
        console.log('hit last async (BAD)')
        res.json({loggedin: true})
    }
)

// WORKING
// router.post(
//     '/login',
//     passport.authenticate(
//         'login', 
//         { session: false, passReqToCallback: true }
//     ),
//     async (req, res) => {
//         console.log('passed login passport')
//         //console.log(req.body)
//         console.log(req.body)
//         res.json({loggedin: true})
//     }
//)

// router.post(
//     '/login',
//     async (res, req, next) => {
//         passport.authenticate(
//             'login', 
//             async (err, user, info) => {
//                 console.log('passport login `info`: ', info, user, err)
//                 try {
//                     if (err) {
//                         console.log('server error')
//                         return next(new Error('server error'))
//                     } else if (!user) {
//                         console.log('could not find user')
//                         return next(new Error('user not found'))
//                     }
//                     req.login(
//                         user,
//                         {session: false},
//                         async (error) => {
//                             if (error) {
//                                 return next(new Error('could not login'))
//                             }
//                             const body = {
//                                 _id: user._id,
//                                 email: user.email
//                             }
//                             const token = jwt.sign({ user: body }, JWT_SECRET)
//                             return res.json({ token })
//                         }
//                     )
//                 } catch(error) {
//                     return next(new Error('unidentified error'))
//                 }
//             }
//         )(req, res, next)
//     }
// )

module.exports = router