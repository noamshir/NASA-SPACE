const { getAllPlanets } = require('../../model/planets.model')

async function httpGetAllPlanets(req, res) {
    const planets = await getAllPlanets()
    res.status(200).json(planets)
}

module.exports = {
    httpGetAllPlanets
}