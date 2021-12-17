const Folder = require('./models/folder')
const User = require('./models/user')
const { getTweet } = require('../twt-api/find')
const { addTweet, searchTweet, parseTweetId } = require('./tweets')

async function newFolder(folderName, userId, done) {
	const user = await User.findById(userId).populate('folders')
	const folderNameRE = new RegExp(folderName, 'i')
	if (user.folders.some((folder) => folderNameRE.test(folder.folderName))) {
		return done(
			{
				status: 409,
				error: {
					created: false,
					folder: false,
					message: 'Folder name already exists'
				}
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
	const response = {
		status: 201,
		message: {
			created: true,
			folder: folder.folderName,
			folderId: folder._id,
			message: `Successfully created folder ${folder.folderName}`,
		},
	}
	return done(null, response)
}

async function unBookmarkTweet(folderId, tweets, userObj, done) {
	const [parsedIds, badIds] = parseTweetId(tweets)
	console.log(`parsed ids:`)
	console.log(parsedIds)
	console.log('bad ids:')
	console.log(badIds)
	return done(null, null)
	// await userObj.populate('folders')
	// const userFolders = userObj.folders.map((folder) => folder.id)
	// if (!userFolders.includes(folderId)) {
	// 	return done(
	// 		{
	// 			status: 406,
	// 			error: {
	// 				deleted: false,
	// 				message: 'User does not have folder',
	// 			},
	// 		},
	// 		false
	// 	)
	// }
	// const searchResults = await searchTweet(tweets)
	// const parsedIds = []
	// const badIds = []
	// tweets.forEach((tweet) => {
	// 	const parsed = parseTweetId(tweet)
	// 	if (parsed) {
	// 		if (!parsedIds.includes(parsed)) {
	// 			parsedIds.push(parsed)
	// 		}
	// 	} else {
	// 		badIds.push(tweet)
	// 	}
	// })
}

async function bookmarkTweet(folderId, tweets, userObj, done) {
	const [parsedIds, badIds] = parseTweetId(tweets)
	if (parsedIds.length < 1) {
		return done(
			{
				status: 422,
				error: {
					bookmarked: 0,
					tweets: false,
					message: 'All tweets invalid',
				}
			}
		)
	}
	await userObj.populate('folders')
	const userFolders = userObj.folders.map((folder) => folder.id)
	if (!userFolders.includes(folderId)) {
		return done(
			{
				status: 404,
				error: {
					bookmarked: 0,
					tweets: false,
					message: 'User does not have folder',
				},
			},
			false
		)
	}
	const dbTweets = parsedIds.length > 0 ? await searchTweet(parsedIds) : []
	const remainingTweets = dbTweets 
		? parsedIds.filter(id => {
			return !(dbTweets.some(dbTweet => dbTweet.twtId === id))
			}) 
		: parsedIds
	const foundTweets = remainingTweets.length > 0 ? await getTweet(remainingTweets) : []
	const addedTweets = foundTweets.found ? await addTweet(foundTweets.found) : []
	const goodTweets = addedTweets.length > 0 ?
		dbTweets.concat(addedTweets)
		: dbTweets || []
	const badTweets = parsedIds.filter(id => {
		return !(goodTweets.some(goodTweet => goodTweet.twtId === id))
	})
	const folder = await Folder.findById(folderId).populate('tweets')
	const alreadyBookmarked = []
	const bookmarked = []
	goodTweets.forEach(tweet => {
		if (folder.tweets.some(folderTwt => folderTwt.twtId === tweet.twtId)) {
			alreadyBookmarked.push(tweet)
		} else {
			folder.tweets.push(tweet._id)
			bookmarked.push(tweet)
		}
	})
	folder.save((err, folder) => {
		if (err) {
			console.error(err)
			return done({
				status: 500,
				error: {
					bookmarked: 0,
					tweets: false,
					message: "Error adding tweets to folder"
				}
			})
		}
		if (folder) {
			return done(null, {
				status: bookmarked.length ? 201 : 409,
				message: {
					sent: tweets.length,
					bookmarkedCount: bookmarked.length,
					bookmarked: bookmarked.map((tweet) => tweet.twtId),
					duplicateCount: alreadyBookmarked.length,
					duplicates: alreadyBookmarked.map((tweet) => tweet.twtId),
					apiErrCount: badTweets.length,
					apiErrIds: badTweets,
					badIdCount: badIds.length,
					badIds: badIds
				},
			})
		}
	})
}

async function getFolder(folderId, userObj, done) {
	await userObj.populate('folders')
	const userFolders = userObj.folders.map((folder) => folder.id)
	if (!userFolders.includes(folderId)) {
		return done(
			{
				status: 404,
				error: {
					folder: false,
					message: 'User does not have folder',
					status: 404
				}
			},
			false
		)
	}
	const folder = await userObj.folders
		.find((folder) => folder.id === folderId)
		.populate('tweets')
	const response = {
		status: 200,
		message: folder
	}
	return done(null, response)
}

async function getAllFolders(userObj, done) {
	await userObj.populate({
		path: 'folders',
		populate: { path: 'tweets' },
	})
	const folders = userObj.folders.map((folder) => {
		return {
			folderName: folder.folderName,
			folderId: folder._id,
			tweets: folder.tweets.map((tweet) => {
				return {
					twtId: tweet.twtId,
					media: tweet.twtMedia.map((media) => media.url),
				}
			}),
		}
	})
	return done(
		null,
		{
			status: 200,
			message: {
				gotFolders: true,
				message: 'Got folders',
				folders: folders
			},
		}
	)
}

async function deleteFolder(folderId, userObj, done) {
	await userObj.populate('folders')
	const userFolders = userObj.folders.map((folder) => folder.id)
	if (!userFolders.includes(folderId)) {
		return done(
			{
				status: 404,
				error: {
					deleted: false,
					message: 'User does not have folder',
				}
			},
			false
		)
	}
	const folder = await Folder.findOneAndDelete({_id: folderId})
	if (!folder) {
		return done(
			{
				status: 500,
				error: {
					deleted: false,
					message: 'Sever failed to delete folder'
				}
			},
			false
		)
	}
	User.updateOne(
		{_id: userObj._id},
		{
			$pull: { folders: folder._id}
		},
		(err, user) => {
			if (err) {
				console.error(err)
			}
			const response = {
				status: 200,
				message: {
					deleted: true,
					message: `Deleted folder ${folder.folderName}`,
					folder: folder,
				},
			}
			return done(null, response)
		}
	)
}

module.exports = {
	newFolder,
	bookmarkTweet,
	getFolder,
	deleteFolder,
	unBookmarkTweet,
	getAllFolders
}
