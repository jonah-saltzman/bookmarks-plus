const express = require('express')
const router = express.Router()

const sendResponse = require('../responder')
const { checkTwtAuth } = require('../db/twitter')

router.post(
    '/check',
    (req, res) => {
        console.log('req.body:')
        console.log(req.body)
        const validAuth = checkTwtAuth(req.userObj, req.body.state)
        res.status(validAuth ? 200 : 401).json({authenticated: validAuth})
    }
)

module.exports = router