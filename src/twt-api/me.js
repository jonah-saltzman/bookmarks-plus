const fetch = require('node-fetch')
const { Headers } = require('node-fetch')

const getUser = async (twtToken) => {
    const URL = 'https://api.twitter.com/2/users/me'
    const response = await fetch(URL, {
			method: 'GET',
			headers: new Headers({
				authorization: 'Bearer ' + twtToken,
			}),
		})
    if (response.status !== 200) {
        return false
    }
    const data = await response.json()
    return data
}

module.exports = getUser