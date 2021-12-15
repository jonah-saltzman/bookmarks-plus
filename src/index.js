require('dotenv').config();
require('./auth/auth')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan');
const { connectDb } = require('./db/mongoose');
const { getTweet } = require('./twt-api/find')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env

const checkToken = require('./auth/token')

const authRouter = require('./routes/authroutes')
const secureRouter = require('./routes/secureroutes')

const PORT = process.env.PORT || 3000

const app = express()

connectDb()

app.use(bodyParser.json())
//app.use(helmet())
app.use(cors())
//app.use(morgan('combined'))
app.use(passport.initialize())



app.use('/auth', authRouter)

app.get('/token', (req, res) => {
	console.log()
	jwt.verify(req.body.token, JWT_SECRET, (err, data) => {
		console.log('err: ', err)
		console.log('data: ', data)
		return res.json({ message: 'token received' })
	})
})

app.get('/', (req, res) => {
	res.status(306)
	res.json({
		message: 'Redirect to client',
		token: req.body.token
	})
})

app.use(checkToken)

app.use('/user', secureRouter)


app.use(function (err, req, res, next) {
	res.status(err.status || 500)
	res.json({ error: err, message: "Internal server error" })
})

app.listen(PORT, async () => {
	console.log(`listening on port ${PORT}`)
})

//getTweet('440322224407314432').then(data => console.log(data))
