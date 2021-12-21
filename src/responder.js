
async function sendResponse(req, res, err, response, redirect) {
    if (err) {
        res.status(err.status)
        return res.json(err.message || err.error)
    }
    if (response) {
        res.status(response.status)
        return res.json(response.response || response.message)
    }
    res.status(500)
    return res.json({message: err.err || "Unknown server error", user: req.userObj.email || null})
}

module.exports = sendResponse