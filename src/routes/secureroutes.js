const express = require('express')
const router = express.Router()
const sendResponse = require('../responder')
const folders = require('../db/folders')

const { invalidateToken } = require('../auth/token')
const twtRouter = require('./twtroutes')

// Custom middleware attaches user object to req object upon
// successful token validation

// Get array of folders belonging to authenticated user
router.get(
    '/folders', 
    async (req, res) => {
        folders.getAllFolders(
            req.userObj,
            (err, folders) => {
                sendResponse(req, res, err, folders)
            }
        )
    }
)

// Create a new folder
// 
// newFolder() handles folder document creation
// and adds its reference to user document
router.post(
    '/folders',
    (req, res) => {
        console.log(req.body)
        folders.newFolder(
            req.body.folderName, 
            req.userObj, 
            (err, folder) => {
                sendResponse(req, res, err, folder)
            }
        )
    }
)

router.post(
    '/folders/:folder',
    (req, res) => {
        folders.changeName(
            req.params.folder,
            req.body.newName,
            req.userObj,
            (err, folder) => {
                sendResponse(req, res, err, folder)
            }
        )
    }
)

router.get(
    '/folders/:folder',
    (req, res) => {
        folders.getOneFolder(
            req.params.folder,
            req.userObj,
            (err, folder) => {
                sendResponse(req, res, err, folder)
            }
        )
    }
)

router.delete(
    '/folders/:folder',
    (req, res) => {
        folders.deleteFolder(
            req.params.folder,
            req.userObj,
            (err, folder) => {
                sendResponse(req, res, err, folder)
            }
        )
    }
)

router.put(
    '/folders/:folder',
    (req, res) => {
        folders.bookmarkTweet(
            req.params.folder,
            req.body.tweets,
            req.userObj,
            (err, tweet) => {
                sendResponse(req, res, err, tweet)
            }
        )
    }
)

router.patch(
    '/folders/:folder',
    (req, res) => {
        folders.unBookmarkTweet(
            req.params.folder,
            req.body.tweets,
            req.userObj,
            (err, response) => {
                sendResponse(req, res, err, response)
            }
        )
    }
)

router.get(
    '/signout',
    (req, res) => {
        invalidateToken(
            req.userObj,
            (err, response) => {
                sendResponse(req, res, err, response)
            }
        )
    }
)

router.get(
    '/twitter',
    (req, res) => {
        sendResponse(req, res, null, {
					status: 200,
					response: {
						message: `${
							req.userObj.twtProfile.data.displayName
						} signed in!`,
						userId: req.userObj._id.toString(),
                        twtUser: req.userObj.twtProfile.data.username,
						token: null,
						twtChallenge: req.userObj.twtChallenge,
						twtAuth: true,
					},
				})
    }
)

router.use('/twt', twtRouter)

module.exports = router