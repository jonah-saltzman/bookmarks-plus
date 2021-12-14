const mongoose = require('mongoose')

function connectDb() {
	if (mongoose.connection.readyState === 0) {
		console.log('connecting mongoose')
		mongoose.connect(MONGO_DEV_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		mongoose.connection.once('open', () => {
			console.log('connected to db')
			return mongoose.connection.readyState
		})
		mongoose.connection.on('error', (err) => {
			console.log('error connecting to db')
			return err
		})
	} else {
		console.log('already connected')
		return mongoose.connection.readyState
	}
}

function getDbStatus() {
	return mongoose.connection.readyState
}

module.exports = {
	connectDb,
	getDbStatus,
}
