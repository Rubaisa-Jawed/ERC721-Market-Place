const { time } = require('console')
const mongoose = require('mongoose')

const enlistSchema = new mongoose.Schema({
    tokenAddress: {
        type: String,
        required: true
    },
    tokenId: {
        type: Number,
        required: true
    },
    transactionHash: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Enlisted_NFTs', enlistSchema)