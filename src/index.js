require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const app = express()

app.use(helmet())

app.use(bodyParser.json())

app.use(cors())

app.use(morgan('combined'))

app.get('/', async (req, res) => {
	res.send('hello-world')
})

app.listen(3003, async () => {
	console.log('listening on port 3003')
	console.log(process.env.API_KEY)
})
