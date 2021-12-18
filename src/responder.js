
async function sendResponse(req, res, err, response, redirect) {
    if (redirect) {
        res.redirect(redirect.path)
        return
    }
    if (err) {
        res.status(err.status)
        return res.json(err.error)
    }
    if (response) {
        res.status(response.status)
        return res.json(response.message)
    }
    res.status(500)
    return res.json({message: "Unknown server error", user: req.userObj.email})
}

module.exports = sendResponse