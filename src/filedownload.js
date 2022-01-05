var https = require('https')

const downloadImage = (url) => {
    return new Promise((resolve, reject) => {
        https
            .get(url, response => {
                const bufferArray = []
                response.on('data', data => bufferArray.push(data))
                response.on('end', () => resolve(Buffer.concat(bufferArray)))
            })
            .on('error', () => reject(false))
        })
}




//         getImg(url, (result) => {
//             if (result) {
//                 resolve(result)
//             } else {
//                 reject(false)
//             }
//         })
//     })
// }

// const getImg = (url, done) => {
//     https
// 		.get(url, (response) => {
// 			const bufferArray = []
// 			response.on('data', (data) => bufferArray.push(data))
// 			response.on('end', () => {
// 				const buffer = Buffer.concat(bufferArray)
//                 return done(buffer)
// 			})
// 		})
// 		.on('error', () => {
// 			return done(false)
// 		})
// }

module.exports = downloadImage
