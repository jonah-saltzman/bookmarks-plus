require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan');
const { connectDb } = require('./db/mongoose');
const { getTweet } = require('./twt-api/find')

const app = express()

app.use(helmet())

app.use(bodyParser.json())

app.use(cors())

app.use(morgan('combined'))

app.get('/', async (req, res) => {
	res.send('hello-world')
})

connectDb()

app.listen(3003, async () => {
	console.log('listening on port 3003')
})

getTweet('440322224407314432').then(data => console.log(data))
