const http = require('http')

require('dotenv').config()

const mongoService = require('./services/mongo')
const app = require('./app')
const server = http.createServer(app)
const { loadPanets } = require('./model/planets.model')
const { loadLaunchData } = require('./model/launches.model')
const PORT = process.env.PORT || 8000

async function startServer() {
    await mongoService.mongoConnect()
    await loadPanets()
    await loadLaunchData()
    server.listen(PORT, () =>
        console.log(`listening on port: ${PORT}`)
    )
}

startServer()
