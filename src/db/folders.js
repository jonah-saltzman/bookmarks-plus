const Folder = require('./models/folder')
const User = require('./models/user')
const { getTweet } = require('../twt-api/find')
const { addTweet, searchTweet, parseTweetId } = require('./tweets')

async function newFolder(folderName, userId, done) {
	const user = await User.findById(userId).populate('folders')
	if (user.folders.some((folder) => folder.folderName === folderName)) {
		return done(
			{
				created: false,
				folder: false,
				message: 'Folder name already exists',
			},
			false
		)
	}
	const folder = await Folder.create({
		user: userId,
		folderName: folderName,
	})
	await User.findByIdAndUpdate(folder.user, {
		$push: { folders: folder._id },
	})
	return done(null, folder)
}

async function bookmarkTweet(folderId, twtId, done) {
	const parsedTwtId = parseTweetId(twtId)
	if (!parsedTwtId) {
		return done(
			{
				bookmarked: false,
				tweet: false,
				message: 'Invalid Tweet ID/URL',
			},
			false
		)
	}
	let newTweet
	const dbTweet = await searchTweet(parsedTwtId)
	if (!dbTweet) {
		const twtData = await getTweet(parsedTwtId)
		if (twtData.errors) {
			return done(
				{ bookmarked: false, tweet: false, message: 'Could not find tweet' },
				false
			)
		}
		if (twtData.data) {
			newTweet = await addTweet(twtData)
			if (!newTweet) {
				return done(
					{
						bookmarked: false,
						tweet: false,
						message: 'Failed to add tweet to db',
					},
					false
				)
			}
		}
	} else {
		newTweet = dbTweet
	}
	if (
		(await Folder.findById(folderId).populate('tweets')).tweets.some(
			(tweet) => tweet.twtId === newTweet.twtId
		)
	) {
		return done(
			{
				bookmarked: false,
				tweet: newTweet,
				message: 'Tweet is already in folder',
			},
			false
		)
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
	bookmarkTweet,
}
