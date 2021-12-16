const Folder = require('./models/folder')
const User = require('./models/user')
const { getTweet } = require('../twt-api/find')
const { addTweet, searchTweet } = require('./tweets')

async function newFolder(folderName, userId, done) {
    const user = await User.findById(userId).populate('folders')
    if (user.folders.some(folder => folder.folderName === folderName)) {
        return done({created: false, folder: false, message: "Folder name already exists"}, false)
    }
    const folder = await Folder.create({
        user: userId,
        folderName: folderName
    })
    await User.findByIdAndUpdate(
			folder.user,
			{
				$push: { folders: folder._id },
			}
		)
    return done(null, folder)
}

async function bookmarkTweet(folderId, twtId, done) {
    console.log(`folderid: ${folderId}, twtId: ${twtId}`)
    let newTweet
    const dbTweet = await searchTweet(twtId)
    if (!dbTweet) {
        const twtData = await getTweet(twtId)
        if (twtData.errors) {
            return done({bookmarked: false, tweet: false, message: 'Could not find tweet'}, false)
        }
        if (twtData.data) {
            newTweet = await addTweet(twtData)
            if (!newTweet) {
                return done({bookmarked: false, tweet: false, message: 'Failed to add tweet to db'}, false)
            }
        }
    } else {
        newTweet = dbTweet
    }
    console.log(`selected tweet to bookmark:`, newTweet)
    if ((await Folder.findById(folderId).populate('tweets')).tweets.some(tweet => tweet.twtId === newTweet.twtId)) {
        return done({bookmarked: false, tweet: newTweet, message: "Tweet is already in folder"}, false)
    }
    Folder.findByIdAndUpdate(
        folderId,
        { $push: { tweets: newTweet._id } },
        (err) => {
            if (err) {
                return done(
                    {
                        bookmarked: false,
                        tweet: newTweet,
                        message: 'Failed to bookmark tweet',
                    },
                    false
                )
            }
            return done(null, newTweet)
        }
    )

}

module.exports = {
    newFolder,
    bookmarkTweet
}