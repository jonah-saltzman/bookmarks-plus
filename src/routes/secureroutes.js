const express = require('express')
const router = express.Router()
const { sendResponse } = require('../middleware')
const {
    newFolder,
    bookmarkTweet,
    getFolder,
    deleteFolder,
    unBookmarkTweet,
    getAllFolders
} = require('../db/folders')

const { invalidateToken } = require('../auth/token')

// Custom middleware attaches user object to req object upon
// successful token validation

// Get array of folders belonging to authenticated user
router.get(
    '/folders',
    async (req, res) => {
        getAllFolders(
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
        newFolder(
            req.body.folderName, 
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
        getFolder(
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
        deleteFolder(
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
        bookmarkTweet(
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
        unBookmarkTweet(
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
        console.log('BEFORE INVALIDATING TOKEN')
        invalidateToken(
            req.userObj,
            (err, response, redirect) => {
                sendResponse(req, res, err, response, redirect)
            }
        )
    }
)

module.exports = router