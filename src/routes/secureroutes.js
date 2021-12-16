const express = require('express')
const router = express.Router()
const sendResponse = require('../sendresponse')
const {
    newFolder,
    bookmarkTweet,
    getFolder,
    deleteFolder,
    unBookmarkTweet
} = require('../db/folders')

// Custom middleware attaches user object to req object upon
// successful token validation

// Get array of folders belonging to authenticated user
router.get(
    '/folders',
    async (req, res) => {
        await req.userObj.populate({
            path: 'folders',
            populate: { path: 'tweets' }
        })
        res.json({
            message: 'Got folders',
            user: req.userObj._id,
            folders: req.userObj.folders.map(folder => {
                return {
                    folderName: folder.folderName,
                    folderId: folder._id,
                    tweets: folder.tweets.map(tweet => {
                        return {
                            twtId: tweet.twtId,
                            media: tweet.twtMedia.map(media => media.url)
                        }
                    })
                }
            })
        })
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

module.exports = router