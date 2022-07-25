const axios = require('axios')

const launches = require('./launches.schema')
const planets = require('./planets.schema');

const DEFAULT_FLIGHT_NUMBER = 100
const SPACEX_API_URL = `https://api.spacexdata.com/v4/launches/query`

const SPACEX_API_FIELDS_MAP = {
    flightNumber: 'flight_number',
    misson: 'name',
    rocket: 'rocket',
    launchDate: 'date_local',
    upcoming: 'upcoming',
    success: 'success',
    customers: 'customers',
    payloads: 'payloads'
}

const SPACEX_FIRST_LAUNCH_FILTER = {
    flightNumber: 1,
    rocket: 'Falcon 1',
    misson: 'FalconSat'
}


async function loadLaunchData() {
    // Because the call to the SPACEX API is very expansive,
    // We need to make sure that we dont have the data from the api call already.
    if (await findLaunch(SPACEX_FIRST_LAUNCH_FILTER)) {
        console.log("Got data from SPACEX API in DB")
    }
    else {
        await populateLaunches()
    }
}

async function populateLaunches() {
    console.log('Downloading launch data from SPACEX API')
    const res = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        'name': 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    })
    if (res.status !== 200) {
        console.log("Error while trying to fetch spacex launches data")
        throw new Error('failed to fetch data from SPACEX API')
    }
    const launchDocs = res?.data?.docs
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc[SPACEX_API_FIELDS_MAP.payloads]
        const customers = payloads.flatMap(payload => payload[SPACEX_API_FIELDS_MAP.customers])
        const launch = {
            flightNumber: launchDoc[SPACEX_API_FIELDS_MAP.flightNumber],
            misson: launchDoc[SPACEX_API_FIELDS_MAP.misson],
            rocket: launchDoc[SPACEX_API_FIELDS_MAP.rocket].name,
            launchDate: launchDoc[SPACEX_API_FIELDS_MAP.launchDate],
            success: launchDoc[SPACEX_API_FIELDS_MAP.success],
            upcoming: launchDoc[SPACEX_API_FIELDS_MAP.upcoming],
            customers
        }
        console.log(`${launch.flightNumber}-${launch.misson} loaded`)

        await saveLaunch(launch)
    }
}

async function findLaunch(filter) {
    return launches.findOne(filter)
}

async function getAllLaunches({ skip, limit }) {
    return await launches.find({}, {
        '__v': 0
    }).sort({ flightNumber: 1 }).skip(skip).limit(limit)
}

async function getLaunchByFlightNumber(flightNumber) {
    return findLaunch({ flightNumber })
}

async function _getLatestFlightNumber() {
    const latestLaunch = await launches.findOne().sort('-flightNumber')
    if (!latestLaunch) return DEFAULT_FLIGHT_NUMBER
    return latestLaunch.flightNumber
}

async function saveLaunch(launch) {
    await launches.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, { upsert: true })
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({ keplerName: launch.target })

    if (!planet) {
        throw new Error('No matching planets was found.')
    }

    const newFlightNumber = await _getLatestFlightNumber() + 1

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['AMZ', 'NASA'],
        flightNumber: newFlightNumber
    })
    await saveLaunch(newLaunch)
}

async function abortLaunchByFlightNumber(flightNumber) {
    const aborted = await launches.updateOne({ flightNumber }, { upcoming: false, success: false })
    return aborted.modifiedCount === 1
}


module.exports = {
    launches,
    getAllLaunches,
    getLaunchByFlightNumber,
    scheduleNewLaunch,
    abortLaunchByFlightNumber,
    loadLaunchData
}