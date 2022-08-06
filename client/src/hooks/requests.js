const API_URL = 'http://localhost:8000/v1'
// Load planets and return as JSON.
async function httpGetPlanets() {
  const response = await fetch(`${API_URL}/planets`)
  return response.json()
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  const response = await fetch(`${API_URL}/launches`)
  const fetchedLaunches = await response.json()
  return fetchedLaunches.sort((a, b) => {
    return a.flightNumber - b.flightNumber
  })

}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  try {
    return await fetch(`${API_URL}/launches`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(launch)
    })
  } catch (error) {
    console.error(error)
    return { ok: false }
  }
}

// Delete launch with given Flight Number.
async function httpAbortLaunch(flightNumber) {
  try {
    return fetch(`${API_URL}/launches/${flightNumber}`, {
      method: 'delete',
    })
  } catch (error) {
    console.error(error)
    return { ok: false }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};