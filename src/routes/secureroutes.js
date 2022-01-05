const express = require('express')
const router = express.Router()
const sendResponse = require('../responder')
const folders = require('../db/folders')

const { invalidateToken } = require('../auth/token')
const twtRouter = require('./twtroutes')
const getLikes = require('../twt-api/likes')
const changePassword = require('../auth/auth')
const { checkTwtAuth } = require('../db/twitter')
const { handleDeleted } = require('../db/tweets')

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

router.patch(
    '/folders/share/:folder',
    (req, res) => {
        folders.setShared(
            req.params.folder,
            req.body.shared,
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

router.patch(
    '/password',
    (req, res) => {
        changePassword(
            req.userObj,
            req.body.old,
            req.body.new,
            (err, response) => {
                sendResponse(req, res, err, response)
            }
        )
    }
)

router.get(
    '/likes',
    (req, res) => {
        getLikes(
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
							req.userObj.twtAuth.data.displayName
						} signed in!`,
						userId: req.userObj._id.toString(),
                        twtUser: req.userObj.twtAuth.data.username,
						token: null,
						twtChallenge: req.userObj.twtChallenge.challenge,
						twtAuth: true,
                        twtName: req.userObj.twtAuth.data.displayName
					},
				})
    }
)
//include state in request
router.post(
    '/deleted/:twtId',
    async (req, res) => {
        console.log('received request for deleted tweet')
        if (await checkTwtAuth(req.userObj, req.body.state)) {
            console.log('twtAuth is valid')
            handleDeleted(req.params.twtId, req.userObj, (err, response) => {
                console.log(err, response)
                console.log('SENDING RESPONSE')
                sendResponse(req, res, err, response)
            })
        } else {
            sendResponse(req, res, {status: 400, message: "Retry Twitter login"}, null)
        }
    }
)
router.use('/twt', twtRouter)

module.exports = router