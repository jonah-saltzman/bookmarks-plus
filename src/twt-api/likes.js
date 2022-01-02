const fetch = require('node-fetch')
const { refreshTwitter } = require('../auth/twitter')
const { Headers } = require('node-fetch')

const getLikes = async (user, done) => {
    const twtUser = user.twtAuth?.twtId || user.twtProfile?.twtId || user.twtId
    const twtToken = user.twtProfile.token
    if (!twtUser || !twtToken) {
        return done({status: 400, message: 'Please retry Twitter login.'})
    }
	const URL = `https://api.twitter.com/2/users/${twtUser}/liked_tweets`
	console.log(`twtUser:`, twtUser)
	console.log('twtToken', twtToken)
	console.log('url:')
	console.log(URL)
	const response = await fetch(URL, {
		method: 'GET',
		headers: new Headers({
			authorization: 'Bearer ' + twtToken,
		}),
	})
	if (response.status !== 200) {
		return done({ status: 503, message: `Couldn't get likes from Twitter.` })
	}
	const data = await response.json()
	const tweets = data.data.map(tweet => tweet.id)
    return done(null, {
        status: 200,
        response: tweets
    })
}

module.exports = getLikes