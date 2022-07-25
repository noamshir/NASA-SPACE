const express = require('express')

const planetsRoutes = require('./planets/planets.router')
const launchesRouter = require('./launches/launches.router')

const api = express.Router()

api.use('/planets', planetsRoutes)
api.use('/launches', launchesRouter)

module.exports = api
