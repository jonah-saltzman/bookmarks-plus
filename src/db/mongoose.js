const mongoose = require('mongoose')

// MongoDB Atlas URI provided by Heroku (production)
// or dotenv (development)
const { MONGODB_URI } = process.env

function connectDb() {

	// If disconnected, connect to the database
	if (mongoose.connection.readyState === 0) {
		console.log('connecting mongoose')
		mongoose.connect(MONGODB_URI, {
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
