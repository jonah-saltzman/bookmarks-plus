const Folder = require('./models/folder')
const User = require('./models/user')
const { getTweet } = require('../twt-api/find')
const { addTweet, searchTweet, parseTweetId } = require('./tweets')

async function newFolder(folderName, userId, done) {
	const user = await User.findById(userId).populate('folders')
	if (user.folders.some((folder) => folder.folderName === folderName)) {
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
	await userObj.populate('folders')
	const userFolders = userObj.folders.map((folder) => folder.id)
	if (!userFolders.includes(folderId)) {
		return done(
			{
				status: 406,
				error: {
					deleted: false,
					message: 'User does not have folder',
				},
			},
			false
		)
	}
	const searchResults = await searchTweet(tweets)
	return
	if (tweets[1]) {
		return done(
			{
				status: 404,
				error: {
					removed: false,
					tweet: false,
					message: "Tweet not in database"
				}
			}
		)
	}
	console.log(userObj.folders)
	return
	const folder = await Folder.findByIdAndUpdate(
		folderId,
		{

		}
	)
}

async function bookmarkTweet(folderId, tweets, userObj, done) {
	const parsedIds = []
	const badIds = []
	tweets.forEach(tweet => {
		const parsed = parseTweetId(tweet)
		if (parsed) {
			parsedIds.push(parsed)
		} else {
			badIds.push(tweet)
		}
	})
	if (!parsedIds) {
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
				status: 406,
				error: {
					bookmarked: 0,
					tweets: false,
					message: 'User does not have folder',
				},
			},
			false
		)
	}
	const dbTweets = await searchTweet(parsedIds)
	const remainingTweets = parsedIds.filter(id => {
		return !(dbTweets.some(dbTweet => dbTweet.twtId === id))
	})

	const foundTweets = await getTweet(remainingTweets)
	console.log(`IDs submitted: ${tweets.length}`)
	console.log(`Parsed: ${parsedIds.length}; Not parsed: ${badIds.length}`)
	console.log(`Tweets in DB: ${dbTweets.length}`)
	console.log(`Tweets retrieved from Twitter: ${foundTweets.found.length}`)
	console.log(`Tweets not retreived from Twitter: ${foundTweets.notFound.length}`)
	console.log(foundTweets)
	const addedTweets = await addTweet(foundTweets.found)
	console.log(addedTweets)
	const goodTweets = addedTweets.data ? dbTweets.concat(addedTweets.data) : dbTweets
	console.log('good tweets: ')
	console.log(goodTweets)
	console.log('after good tweets')
	const badTweets = parsedIds.filter(id => {
		return !(goodTweets.some(goodTweet => goodTweet.twtId === id))
	})
	console.log(`FINALLY: ${goodTweets.length} in DB, ${badTweets.length} not added`)
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
	folder.save((err, folder, rows) => {
		console.log(`rows: ${rows}`)
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

// 	const dbTweet = await searchTweet(parsedTwtId)
// 		const twtData = await getTweet(parsedTwtId)
// 		if (twtData.errors) {
// 			return done(
// 				{
// 					status: 503,
// 					error: {
// 						bookmarked: false,
// 						tweet: false,
// 						message: 'Could not find tweet'
// 					}
// 				}
// 			)
// 		}
// 		if (twtData.data) {
// 			newTweet = await addTweet(twtData)
// 			if (!newTweet) {
// 				return done(
// 					{
// 						status: 500,
// 						error: {
// 							bookmarked: false,
// 							tweet: false,
// 							message: 'Failed to add tweet to db',
// 						}
// 					}
// 				)
// 			}
// 		}
// 	} else {
// 		newTweet = dbTweet
// 	}
// 	if (
// 		(await Folder.findById(folderId).populate('tweets')).tweets.some(
// 			(tweet) => tweet.twtId === newTweet.twtId
// 		)
// 	) {
// 		return done(
// 			{
// 				status: 409,
// 				error: {
// 					bookmarked: false,
// 					tweet: newTweet,
// 					message: 'Tweet is already in folder',
// 				}
// 			}
// 		)
// 	}
// 	Folder.findByIdAndUpdate(
// 		folderId,
// 		{ $push: { tweets: newTweet._id } },
// 		(err) => {
// 			if (err) {
// 				return done(
// 					{
// 						status: 500,
// 						error: {
// 							bookmarked: false,
// 							tweet: newTweet,
// 							message: 'Failed to bookmark tweet',
// 						}
// 					}
// 				)
// 			}
// 			const response = {
// 				status: 201,
// 				message: {
// 					bookmarked: true,
// 					tweet: newTweet,
// 					message: `Bookmarked tweet ${newTweet._id}`
// 				}
// 			}
// 			return done(null, response)
// 		}
// 	)
// }
}

async function getFolder(folderId, userObj, done) {
	await userObj.populate('folders')
	const userFolders = userObj.folders.map(folder => folder.id)
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
	const response = {
		status: 200,
		message: {
			deleted: true,
			message: `Deleted folder ${folder.folderName}`,
			folder: folder
		}
	}
	return done(null, response)
}

module.exports = {
	newFolder,
	bookmarkTweet,
	getFolder,
	deleteFolder,
	unBookmarkTweet
}
