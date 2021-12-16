const Tweet = require('./models/tweet')

async function searchTweet(twtId) {
    const tweet = await Tweet.findOne({twtId: twtId})
    console.log('search db for tweet: ', tweet)
    return tweet ? tweet : false
}

async function addTweet(twtData) {
    const dataObj = twtData.data[0]
    const twtAuthor = twtData.includes.users.find(user => user.id === dataObj.author_id)
    const twtObj = {
			twtId: dataObj.id,
			twtMetrics: dataObj.public_metrics,
            twtDate: dataObj.created_at,
            twtText: dataObj.text,
            twtAuthor: twtAuthor,
            twtMedia: twtData.includes.media.map(media => {
                return {key: media.media_key, url: media.url || media.preview_image_url}
            })
		}
    const tweet = await Tweet.create(twtObj)
    return tweet ? tweet : false
}

module.exports = {
    addTweet,
    searchTweet
}