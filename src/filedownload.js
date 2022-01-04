var https = require('https')

const downloadImage = async (url, done) => {
	https.get(url, (response) => {
        const bufferArray = []
        response.on('data', (data) => bufferArray.push(data))
        response.on('end', () => {
            return done(null, Buffer.concat(bufferArray))
        })
    })
    .on('error', e => done(e, null))
}

module.exports = downloadImage
