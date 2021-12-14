const fetch = require('node-fetch')
const { Headers } = require('node-fetch')
const { TWT_TOKEN } = process.env

const TWEET_PREFIX = 'https://api.twitter.com/2/tweets?ids='
const TWEET_SUFFIX =
	'&tweet.fields=attachments,author_id,created_at,public_metrics,source&expansions=author_id,attachments.media_keys&media.fields=preview_image_url,url'

async function getTweet(twtId) {
    const URL = TWEET_PREFIX + twtId + TWEET_SUFFIX
    try {
        const response = await fetch(URL, {
            method: 'GET',
            headers: new Headers({
                authorization: 'Bearer ' + TWT_TOKEN
            })
        })
    const data = await response.json()
    return data
    } catch(e) {
        console.error(e)
        return false
    }
}

module.exports = {
    getTweet
}