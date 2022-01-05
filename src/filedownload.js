var https = require('https')

const downloadImage = (url) => {
    return new Promise((resolve, reject) => {
        get(url, (result) => {
					if (result) {
						console.log('got buffer, returning')
						resolve(result)
					} else {
						console.log('failed to get buffer')
						reject(false)
					}
				})
    })
}

const get = (url, done) => {
    https
		.get(url, (response) => {
			const bufferArray = []
			response.on('data', (data) => bufferArray.push(data))
			response.on('end', () => {
				const buffer = Buffer.concat(bufferArray)
                console.log('download successful')
                return done(buffer)
			})
		})
		.on('error', () => {
            console.log('error in get')
			return done(false)
		})
}

module.exports = downloadImage
