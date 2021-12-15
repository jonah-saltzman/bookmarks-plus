const Folder = require('./models/folder')
const User = require('./models/user')

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

module.exports = {
    newFolder
}