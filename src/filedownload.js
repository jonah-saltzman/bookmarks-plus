var https = require('https')

const downloadImage = async (url, done) => {
	https.get(url, (response) => {
        const bufferArray = []
        response.on('data', (data) => bufferArray.push(data))
        response.on('end', () => {
            const buffer = Buffer.concat(bufferArray)
            console.log(url)
            console.log('type of buffer: ', typeof buffer)
            done(null, buffer)
        })
    })
    .on('error', e => done(e, null))
}

module.exports = downloadImage
