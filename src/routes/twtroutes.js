const express = require('express')
const router = express.Router()

const sendResponse = require('../responder')
const { checkTwtAuth } = require('../db/twitter')
const { refreshTwitter } = require('../auth/twitter')

router.post(
    '/check',
    async (req, res) => {
        let validAuth = await checkTwtAuth(req.userObj, req.body.state)
        if (validAuth) {
            return res.status(200).json({ authenticated: validAuth})
        }
        if (req.userObj?.twtAuth?.offline === true) {
            await refreshTwitter(req, res)
        }
        validAuth = await checkTwtAuth(req.userObj, req.body.state)
        res.status(validAuth ? 200 : 401).json({authenticated: validAuth})
    }
)

module.exports = router