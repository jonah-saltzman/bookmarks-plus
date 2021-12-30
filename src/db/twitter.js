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

module.exports = {
    checkTwtAuth
}