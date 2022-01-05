const { response } = require('express')
const Tweet = require('./models/tweet')
const urlTwtIdRE = new RegExp(/(?:\/)(\d+)(?:\/|\?|$)/)
const twtIdRE = new RegExp(/^\d+$/)
const altIdRE = new RegExp(/(?:^|\D)(\d+)(?:\D|$)/)
const { getTweet } = require('../twt-api/find')

//response.status & response.response

async function handleDeleted(twtId, user, done) {
    let dbResult;
    if (!twtId) {
        return done({status: 400, error: 'Missing parameter'}, null)
    }
    dbResult = await Tweet.findOne({twtId: twtId})
    if (dbResult) {
        return done(null, {status: 200, response: {tweet: dbResult}})
    }
    try {
        const tweet = await getTweet([twtId], user)
        if (tweet.found.length > 0) {
            const added = await addTweet(tweet.found)
            if (added.length > 0) {
                if (added[0].twtMedia.length > 0) {
                    const finished = await added[0].fetchImages()
                    if (finished) {
                        return done(null, { status: 200, response: { tweet: added[0] } })
                    } else {
                        return done({status: 500, error: 'Couldnt get images'})
                    }
                } else {
                    return done(null, { status: 200, response: { tweet: added[0] } })
                }
            } else {
                return done({status: 500, error: 'Failed to add tweet to DB'})
            }
        } else {
            return done({status: 503, error: 'Tweet no longer exists'})
        }
    } catch(err) {
        return done(err, null)
    }
}

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
            twtHtml: data.html,
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
    parseTweetId,
    handleDeleted
}