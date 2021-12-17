const fetch = require('node-fetch')
const { Headers } = require('node-fetch')
const { TWT_TOKEN } = process.env

const TWEET_PREFIX = 'https://api.twitter.com/2/tweets?ids='
const TWEET_SUFFIX =
	'&tweet.fields=attachments,author_id,created_at,public_metrics,source&expansions=author_id,attachments.media_keys&media.fields=preview_image_url,url'

async function getTweet(tweets) {
    const tweetString = tweets.length > 1 ? tweets.join(',') : tweets[0]
    const URL = TWEET_PREFIX + tweetString + TWEET_SUFFIX
    try {
        const response = await fetch(URL, {
            method: 'GET',
            headers: new Headers({
                authorization: 'Bearer ' + TWT_TOKEN
            })
        })
    const data = await response.json()
    const notFound = data.errors
			? data.errors.map((error) => {
					const errObj = {
						error: 'Not found',
						id: error.value || error.resource_id,
					}
					return errObj
			  })
			: []
    if (!data.data) {
        return { found: [], notFound }
    }
    const found = data.data.map(tweet => {
        const twtObj = {
            data: tweet,
            includes: {
                media: tweet.attachments 
                    ? data.includes.media.filter(
                        media => tweet.attachments.media_keys.some(
                            key => key === media.media_key)) 
                    : null,
                users: data.includes.users.find(
                    user => tweet.author_id === user.id
                )
            }
        }
        return twtObj
    })
    return { found, notFound }
    } catch(e) {
        console.error(e)
        return false
    }
}

module.exports = {
    getTweet
}