const express = require('express')
const { httpGetAllLaunches, httpPostLaunch, httpDeleteLaunch } = require('./launches.controller')

const router = express.Router()

router.get('/', httpGetAllLaunches)
router.post('/', httpPostLaunch)
router.delete('/:flightNumber', httpDeleteLaunch)

module.exports = router