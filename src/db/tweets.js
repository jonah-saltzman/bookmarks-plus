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
    return insertedTweets
}

function parseTweetId(tweets) {
    const parsedIds = []
    const badIds = []
    for (const string of tweets) {
        let id = null
        if (urlTwtIdRE.test(string)) {
		    id = string.match(urlTwtIdRE)[1]
        } else if (altIdRE.test(string)) {
            id = string.match(altIdRE)[1]
        } else if (twtIdRE.test(string)) {
            id = string.match(twtIdRE)[0]
        }
        if (id) {
            if (!parsedIds.includes(id)) {
                parsedIds.push(id)
            }
        } else {
            badIds.push(string)
        }
    }
    return [parsedIds, badIds]
}

module.exports = {
    addTweet,
    searchTweet,
    parseTweetId
}