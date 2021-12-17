const Tweet = require('./models/tweet')
const urlTwtIdRE = new RegExp(/(?:\/)(\d+)(?:\/|\?|$)/)
const twtIdRE = new RegExp(/^\d+$/)
const altIdRE = new RegExp(/(?:^|\D)(\d+)(?:\D|$)/)

async function searchTweet(tweets) {
    const results = await Tweet.find({
			twtId: { $in: tweets },
		})
    return results.length > 0 ? results : []
}

async function addTweet(tweets) {
    console.log('inserting tweets: ')
    console.log(tweets)
    const docsArray = []
    for (const tweet of tweets) {
        const data = tweet.data
        const media = tweet.includes.media
        const author = tweet.includes.users
        docsArray.push({
            twtId: data.id,
            twtMetrics: data.public_metrics,
            twtDate: data.created_at,
            twtText: data.text,
            twtAuthor: author,
            twtMedia: media ? media.map(media => ({ 
                key: media.media_key,
                url: media.url || media.preview_image_url
            })) : []
        })
    }
    const insertedTweets = await Tweet.insertMany(docsArray)
    console.log('inserted tweets: ')
    console.log(insertedTweets)
    return insertedTweets
}

function parseTweetId(string) {
	if (urlTwtIdRE.test(string)) {
		return string.match(urlTwtIdRE)[1]
	}
    if (altIdRE.test(string)) {
        return string.match(altIdRE)[1]
    }
	if (twtIdRE.test(string)) {
		return string.match(twtIdRE)[0]
	}
	return false
}

module.exports = {
    addTweet,
    searchTweet,
    parseTweetId
}