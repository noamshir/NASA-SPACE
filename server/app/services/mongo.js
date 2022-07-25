const mongoose = require('mongoose')

//We import it also here for the tests
require('dotenv').config()

const MONGO_URL = process.env.MONGO_URL

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!')
})

mongoose.connection.on('error', (err) => {
    console.error('error in MongoDB', err)
})

async function mongoConnect() {
    await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
    await mongoose.disconnect()
}

module.exports = { mongoConnect, mongoDisconnect }

