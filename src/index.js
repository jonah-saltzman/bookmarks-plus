require('dotenv').config();
require('./auth/auth')

// NPM Middleware
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const connectDb = require('./db/mongoose');
const passport = require('passport')
const session = require('express-session')

// Custom middleware
const { checkToken } = require('./auth/token')
const sendResponse = require('./responder')
const { twtAuth, twtLogin, twtLoginCB } = require('./auth/twitter')

// Express routers
const authRouter = require('./routes/authroutes')
const secureRouter = require('./routes/secureroutes');

// Port supplied by Heroku or set to 3000
const PORT = process.env.PORT || 4000

const app = express()

// Open connection to MongoDB Atlas
connectDb()

// Middleware for all routes
app.use(bodyParser.json())
app.use(cors())
app.use(passport.initialize())

// app.use((req, res, next) => {
// 	console.log('============================================')
// 	console.log(req.url)
// 	console.log(req.method)
// 	console.log(req.params)
// 	console.log(req.query)
// 	console.log(req.body)
// 	console.log('============================================')
// 	next()
// })

//app.use(logRequest)
app.get('/', (req, res) => res.json({message: "Welcome!"}))

app.get('/twtauth', twtAuth)
// app.get('/twtlogin', twtLogin)
// app.get('/twtlogincb', twtLoginCB)

// Authentication routes don't require token validation
app.use('/auth', authRouter)

// User routes require token validation
app.use(checkToken)

// Authorized routes
app.use('/user', secureRouter)

// Final error catch
app.use(sendResponse)

app.listen(PORT, async () => {
	console.log(`listening on port ${PORT}`)
})
