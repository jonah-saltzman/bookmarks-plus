const Image = require('./models/image')

const serveImage = async (req, res) => {
    const mediaKey = req.params.key
    console.log(mediaKey)
    const img = await Image.findOne({ media_key: mediaKey })
    if (img) {
        console.log('res.sending buffer')
        const buffer = await img.getBuffer()
        return res.status(200).set('Content-Type', `image/${img.type}`).send(buffer)
    } else {
        res.status(404).send("no data")
    }
}

module.exports = serveImage