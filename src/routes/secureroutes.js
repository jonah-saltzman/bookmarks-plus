const express = require('express')
const router = express.Router()
const { newFolder } = require('../db/folders')

router.get(
    '/folders',
    async (req, res) => {
        await req.userObj.populate('folders')
        res.json({
            message: 'Got folders',
            user: req.userObj._id,
            folders: req.userObj.folders.map(folder => folder.folderName)
        })
    }
)

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

module.exports = router