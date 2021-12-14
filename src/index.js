require('dotenv').config();
require('./auth/auth')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan');
const { connectDb } = require('./db/mongoose');
const { getTweet } = require('./twt-api/find')
const authRouter = require('./routes/authroutes')
const passport = require('passport')

const PORT = process.env.PORT || 3000

const app = express()

connectDb()

app.use(passport.initialize())
app.use(helmet())
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('combined'))
app.use(authRouter)


app.get('/', async (req, res) => {
	res.send('hello-world')
})

app.listen(PORT, async () => {
	console.log(`listening on port ${PORT}`)
})

//getTweet('440322224407314432').then(data => console.log(data))
