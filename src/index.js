require('dotenv').config();
require('./auth/auth')

// NPM Middleware
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { connectDb } = require('./db/mongoose');
const passport = require('passport')
const jwt = require('jsonwebtoken')

// Custom token middleware
const { JWT_SECRET } = process.env
const { checkToken, validateToken} = require('./auth/token')

// Express routers
const authRouter = require('./routes/authroutes')
const secureRouter = require('./routes/secureroutes')

// Port supplied by Heroku or set to 3000
const PORT = process.env.PORT || 3000

const app = express()

// Open connection to MongoDB Atlas
connectDb()

// Middleware for all routes
app.use(bodyParser.json())
app.use(cors())
app.use(passport.initialize())

// Authentication routes don't require token validation
app.use('/auth', authRouter)

// Routes for testing API & token validation
app.get('/token', (req, res) => validateToken(req, res))
app.get('/', (req, res) => {
	res.status(204)
	res.json({ message: 'Redirect to client' })
})

// User routes require token validation
app.use(checkToken)

// Authorized routes
app.use('/user', secureRouter)

// Final error catch
app.use(function (err, req, res, next) {
	res.status(err.status || 500)
	res.json({ error: err, message: "Internal server error" })
})

app.listen(PORT, async () => {
	console.log(`listening on port ${PORT}`)
})
