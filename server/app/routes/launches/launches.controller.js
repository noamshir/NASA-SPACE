const { getAllLaunches, scheduleNewLaunch, getLaunchByFlightNumber, abortLaunchByFlightNumber } = require('../../model/launches.model')
const { getPagination } = require('../../services/query')

async function httpGetAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query)
    const launches = await getAllLaunches({ skip, limit })
    res.status(200).json(launches)
}

async function httpPostLaunch(req, res) {
    const launch = req.body

    if (!launch.mission || !launch.launchDate || !launch.target || !launch.rocket)
        return res.status(400).json({ error: 'Missing required launch property' })

    launch.launchDate = new Date(launch.launchDate)

    if (isNaN(launch.launchDate)) {
        return res.status(400).json(
            {
                error: 'Invalid Date provided'
            }
        )
    }
    try {
        await scheduleNewLaunch(launch)
        res.status(201).json(launch)
    } catch (error) {
        console.log({error})
        res.status(500).json({ error })
    }

}

async function httpDeleteLaunch(req, res) {
    const flightNumber = +req.params.flightNumber
    if (! await getLaunchByFlightNumber(flightNumber)) {
        return res.status(404).json({
            error: 'Launch not found'
        })
    }
    const success = await abortLaunchByFlightNumber(flightNumber)
    if (!success) return res.status(400).send({ error: 'Launch not aborted' })
    return res.status(200).json({ ok: true })
}

module.exports = {
    httpGetAllLaunches,
    httpPostLaunch,
    httpDeleteLaunch
}