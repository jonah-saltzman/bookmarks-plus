const express = require('express')
const router = express.Router()
const passport = require('passport')

// router.post(
//     '/signup',
//     passport.authenticate('signup', {session: 'false'}),
//     async (req, res, next) => {
//         const parsedReq = req.body.json()
//         console.log('req: ', parsedReq)
//         res.json({
//             registered: true,
//             user: req.user
//         })
//     }
// )

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

module.exports = router