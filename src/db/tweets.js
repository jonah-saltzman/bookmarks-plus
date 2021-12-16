const Tweet = require('./models/tweet')
const urlTwtIdRE = new RegExp(/(?:\/)(\d+)(?:\/|\?|$)/)
const twtIdRE = new RegExp(/^\d+$/)

async function searchTweet(tweets) {
    const results = await Tweet.find({
			twtId: { $in: tweets },
		})
    return results.length > 0 ? results : false
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
            twtMedia: twtData.includes.media ? twtData.includes.media.map(media => {
                return {key: media.media_key, url: media.url || media.preview_image_url}
            }) : []
		}
    const tweet = await Tweet.create(twtObj)
    return tweet ? tweet : false
}

function parseTweetId(string) {
	if (urlTwtIdRE.test(string)) {
		return string.match(urlTwtIdRE)[1]
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