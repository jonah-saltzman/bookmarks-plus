const Folder = require('./models/folder')
const User = require('./models/user')
const { getTweet } = require('../twt-api/find')
const { addTweet, searchTweet, parseTweetId } = require('./tweets')
const sendResponse = require('../responder')

async function setShared(folderId, value, userObj, done) {
	await userObj.populate('folders')
	const userFolders = userObj.folders.map((folder) => folder.id)
	if (!userFolders.includes(folderId)) {
		return done(
			{ status: 404, error: { message: 'User does not have folder' } }
		)
	}
	const folder = await Folder.findById(folderId)
	if (!folder) {
		return done(
			{ status: 404, error: { message: 'User does not have folder' } }
		)
	}
	const result = await folder.setShared(value)
	if (value && result) {

		return done(null, { status: 200, response: {shared: true, url: result}})
	}
	return done (null, { status: 200, response: { shared: false, url: null } })
}

async function newFolder(folderName, userId, done) {
	const user = await User.findById(userId).populate('folders')
	const folderNameRE = new RegExp('^' + folderName + '$', 'i')
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
	try {
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
	} catch (err) {
		return done(err, null)
	}
}

async function changeName(folderId, newName, userObj, done) {
	await userObj.populate('folders')
	const folderNameRE = new RegExp('^' + newName + '$', 'i')
	if (userObj.folders.some((folder) => folderNameRE.test(folder.folderName))) {
		return done(
			{
				status: 409,
				error: {
					renamed: false,
					folder: false,
					message: 'Folder name already exists',
				},
			},
			false
		)
	}
	const userFolders = userObj.folders.map((folder) => folder.id)
	if (!userFolders.includes(folderId)) {
		return done(
			{
				status: 404,
				error: {
					renamed: false,
					folder: false,
					message: 'User does not have folder',
				},
			},
			false
		)
	}
	try {
		await Folder.findByIdAndUpdate(folderId, {
			folderName: newName
		})
		const newFolder = await Folder.findById(folderId)
		if (newFolder.folderName === newName) {
			const response = {
				status: 201,
				message: {
					renamed: true,
					folder: newFolder.folderName,
					folderId: newFolder._id,
					message: `Renamed folder to ${newFolder.folderName}`,
				},
			}
			return done(null, response)
		}
		return done({
			status: 500,
			error: {
				renamed: false,
				folder: false,
				message: 'Error updating folder name',
			},
		})
	} catch (err) {
		return done(err, null)
	}
}

async function unBookmarkTweet(folderId, tweets, userObj, done) {
	const [parsedIds, badIds] = parseTweetId(tweets)
	if (parsedIds.length < 1) {
		return done({
			status: 422,
			error: {
				removed: 0,
				tweets: false,
				message: 'All tweets invalid',
			},
		})
	}
	await userObj.populate('folders')
	const userFolders = userObj.folders.map((folder) => folder.id)
	if (!userFolders.includes(folderId)) {
		return done(
			{
				status: 404,
				error: {
					removed: 0,
					tweets: false,
					message: 'User does not have folder',
				},
			},
			false
		)
	}
	const folder = await Folder.findById(folderId).populate('tweets')
	if (folder.tweets.length === 0) {
		return done(
			{
				status: 406,
				error: {
					removed: 0,
					tweets: false,
					message: 'Selected folder is already empty',
				},
			},
			false
		)
	}
	const [ inFolder, notInFolder ] = [ [], [], ]
	parsedIds.forEach(id => {
		folder.tweets.some((tweet) => tweet.twtId === id)
			? inFolder.push(id)
			: notInFolder.push(id)
	})
	if (inFolder.length === 0) {
		return done({
			status: 404,
			error: {
				removed: 0,
				tweets: false,
				message: 'No selected tweets in selected folder',
			},
		})
	}
	const pull = inFolder
		.map(twtId => folder.tweets.find(tweet => tweet.twtId === twtId))
		.map(tweet => tweet._id)
	await Folder.findByIdAndUpdate(
		folder._id,
		{
			$pull: { tweets: { $in: pull}},
		}
	)
	const patchedFolder = await Folder.findById(folder._id)
	const [deleted, notDeleted] = [ [], [] ]
	inFolder.forEach(twtId => {
		patchedFolder.tweets.some(tweet => tweet.twtId === twtId)
			? notDeleted.push(twtId)
			: deleted.push(twtId)
	})
	if (deleted.length === 0) {
		return done({
			status: 500,
			error: {
				removed: 0,
				tweets: false,
				message: "Server failed to delete tweets"
			}
		})
	}
	return done(false, {
		status: 200,
		message: {
			sent: tweets.length,
			deletedCount: deleted.length,
			deleted: deleted,
			notFoundCount: notInFolder.length,
			notFound: notInFolder,
			failedCount: notDeleted.length,
			failed: notDeleted,
			badIdsCount: badIds.length,
			badIds: badIds
		}
	})
}

async function bookmarkTweet(folderId, tweets, userObj, done) {
	const [parsedIds, badIds] = parseTweetId(tweets)
	if (parsedIds.length === 0) {
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
		? parsedIds.filter(twtId => !(dbTweets.some(dbTweet => dbTweet.twtId === twtId)))
		: parsedIds
	const foundTweets = remainingTweets.length > 0 ? await getTweet(remainingTweets, userObj) : []
	const addedTweets = foundTweets.found ? await addTweet(foundTweets.found) : []
	const goodTweets = addedTweets.length > 0 
		? dbTweets.concat(addedTweets)
		: dbTweets || []
	const badTweets = parsedIds.filter(twtId => (
		!(goodTweets.some(goodTweet => goodTweet.twtId === twtId))
	))
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
				status: 201,
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

async function getOneFolder(folderId, userObj, done) {
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
			shared: folder.shared,
			url: folder.url || null,
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

async function getSharedFolder(req, res) {
	const url = req.body.url
	console.log(`request for url: ${url}`)
	const folder = await Folder.findOne({url: url})
	if (!folder) {
		return sendResponse(req, res, {status: 404, error: 'Folder not found'})
	}
	if (!folder.shared || !folder.url) {
		return sendResponse(req, res, {status: 401, error: 'Folder is not shared'})
	}
	await folder.populate('tweets')
	console.log(folder)
	const folderObj = {
		folderName: folder.folderName,
		tweets: folder.tweets
	}
	const response = {
		status: 200,
		response: {folder: folder},
	}
	sendResponse(req, res, null, response)
}

module.exports = {
	newFolder,
	bookmarkTweet,
	getOneFolder,
	deleteFolder,
	unBookmarkTweet,
	getAllFolders,
	changeName,
	setShared,
	getSharedFolder
}
