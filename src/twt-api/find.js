const fetch = require('node-fetch')
const { Headers } = require('node-fetch')
const { TWT_TOKEN } = process.env

const TWEET_PREFIX = 'https://api.twitter.com/2/tweets?ids='
const TWEET_SUFFIX =
	'&tweet.fields=attachments,author_id,created_at,public_metrics,source&expansions=author_id,attachments.media_keys&media.fields=preview_image_url,url'

async function getTweet(tweets, user) {
    let token;
    if (user.twtProfile?.token) {
        console.log('using ACCESS token')
        token = user.twtProfile.token
    } else {
        console.log('using APP token')
        token = TWT_TOKEN
    }
    const URLs = tweets.map(twtId => TWEET_PREFIX + twtId + TWEET_SUFFIX)
    const OPTIONS = {
			method: 'GET',
			headers: new Headers({
				authorization: 'Bearer ' + token,
			}),
		}
    try {
        const results = {found: [], notFound: []}
        const responses = await Promise.all(URLs.map(async (url) => {
            const tempResult = await fetch(url, OPTIONS)
            return tempResult.json()
        }))
        responses.forEach((response, i) => {
                    const data = response.errors ? null : response.data[0]
					response.errors
						? results.notFound.push({
								error: 'Not found',
								id: response.errors[0].parameters.ids[0],
						  })
						: results.found.push({
								data: data,
								includes: {
									media: data.attachments
										? response.includes.media.filter((media) =>
												data.attachments.media_keys.some(
													(key) => key === media.media_key
												)
										  )
										: null,
									users: response.includes.users.find(
										(user) => data.author_id === user.id
									),
								},
						  })
				})
        if (results.found.length === 0) {
            return results
        }
        for (const tweet of results.found) {
            const embedURL = `https://publish.twitter.com/oembed?maxheight=200&theme=dark&dnt=true&omit_script=true&url=https://twitter.com/${tweet.includes.users.username}/status/${tweet.data.id}`
            const htmlResponse = await fetch(
                embedURL,
                {method: 'GET'}
            )
            const htmlData = await htmlResponse.json()
            if (htmlData) {
                tweet.data.html = htmlData.html
            }
        }
        return results
    } catch(e) {
        console.error(e)
        return false
    }
}

module.exports = {
    getTweet
}