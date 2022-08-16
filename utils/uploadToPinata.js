const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_SECRET_KEY
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imageFilePath) {
    const fullImagePath = path.resolve(imageFilePath)
    const files = fs.readdirSync(fullImagePath)
    console.log(files)
    let responses = []
    console.log("Uploading To Pinata...")
    for (fileIndex in files) {
        console.log("Woring on " + fileIndex)
        const readableStreamForFile = fs.createReadStream(
            `${fullImagePath}/${files[fileIndex]}`
        )
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (error) {
            console.error(error)
        }
    }
    return { responses, files }
}
async function storeTokenUriMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.error(error)
    }
    return null
}
module.exports = { storeImages, storeTokenUriMetadata }
