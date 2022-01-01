const Login = require('./models/login')
const User = require('./models/user')
const { randomBytes } = require('crypto')

const checkTwtAuth = ({twtProfile}, clientState) => {
    console.log(`dbState: `, twtProfile.twtState)
    console.log(`clientState: `, clientState)
    if (!twtProfile.token || !twtProfile.twtState || !twtProfile.tokenExp) {
        console.log('missing parameter')
        return false
    }
    if (twtProfile.twtState !== clientState) {
        console.log('bad state')
        return false
    }
    if (twtProfile.tokenExp < (new Date())) {
        console.log('expired twtToken')
        return false
    }
    console.log('valid twtAuth')
    return true
}

const newTwtLogin = async (state, done) => {
    const existingLogin = await Login.findOne({loginState: state})
    if (existingLogin) {
        console.log('found existing challenge')
        return done(null, {
					status: 200,
					response: { challenge: existingLogin.loginChallenge.challenge },
				})
    }
    const newLogin = await Login.create({loginState: state})
    if (!state || !newLogin) {
        return done({status: 500, error: "Database error"})
    }
    const challenge = await newLogin.newChallenge()
    if (challenge) {
        return done(null, {status: 200, response: {challenge: challenge}})
    }
    return done({status: 500, error: "Unknown error"})
}

const performTwitterLogin = async (userData, tokenInfo, newState, done) => {
    console.log(userData)
    const refresh = tokenInfo.scope.split(' ').includes('offline.access')
    const twtAuth = {
			twtId: userData.id,
			twtToken: tokenInfo.access_token,
			offline: refresh,
            refreshToken: refresh ? tokenInfo.refresh_token : null,
            data: {
                id: userData.id,
                displayName: userData.name,
                username: userData.username
            }
		}
    const date = new Date()
    date.setMinutes(date.getMinutes() + 115)
    const twtProfile = {
        token: tokenInfo.access_token,
        tokenExp: date,
        twtState: newState
    }
    const user = await User.findOne({ twtId: userData.id })
    if (user) {
        user.twtAuth = twtAuth
        user.twtProfile = twtProfile
        await user.save()
        return done(null, user)
    }
    const newUser = await User.create({
        twtId: userData.id,
        twtAuth: twtAuth,
        twtProfile: twtProfile,
        email: randomBytes(8).toString('hex'),
    })
    if (newUser) {
        console.log('created new user')
        return done(null, newUser)
    }
    console.log('UNKNOWN ERROR')
    return done({ error: 'Unknown error' })
}

module.exports = {
    checkTwtAuth,
    newTwtLogin,
    performTwitterLogin
}