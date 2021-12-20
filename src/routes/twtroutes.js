const express = require('express')
const router = express.Router()
const sendResponse = require('../responder')
const twtAuth = require('../auth/twitter')

const passport = require('passport')

router.use(twtAuth)

router.get(
    '/redirect',
    (req, res) => {
        if (req.userObj) {
            console.log(`logged in user: ${req.userObj.email}`)
            if (req.userObj.twtToken) {
                console.log(`and logged into twitter`)
                res.status(200)
                return res.json({message: "Twitter auth success!"})
            } else {
                console.log(`but twitter auth failed`)
                res.status(500)
                return res.json({ message: 'Twitter auth failed!' })
            }
        } else {
            console.log('local auth failed')
            res.status(500)
            return res.json({ message: 'Local auth failed' })
        }
    }
)

module.exports = router