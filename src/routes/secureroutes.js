const express = require('express')
const router = express.Router()
const { newFolder, bookmarkTweet } = require('../db/folders')

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
            async (err, folder) => {
                if (err) {
                    res.status(422)
                    return res.json(err)
                }
                if (folder) {
                    res.status(201)
                    return res.json({
                        created: true,
                        folder: folder.folderName,
                        message: `Successfully created folder ${folder.folderName}`
                    })
                }
                res.status(500)
                res.json({
                    created: false,
                    folder: false,
                    message: 'Internal server error'
                })
            }
        )
    }
)

router.put(
    '/folders/:folder',
    (req, res) => {
        bookmarkTweet(
            req.params.folder,
            req.body.twtId,
            async (err, tweet) => {
                if (err) {
                    res.status(500)
                    return res.json(err)
                }
                if (tweet) {
                    res.status(201)
                    return res.json(
                        {
                            bookmarked: true,
                            tweet: tweet,
                            message: `Bookmarked tweet ${tweet._id}`
                        }
                    )
                }
                res.status(500)
                return res.json(
                    {
                        bookmarked: false,
                        tweet: false,
                        message: 'Unknown server error'
                    }
                )
            }
        )
    }
)

module.exports = router