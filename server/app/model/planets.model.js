const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse')

const planets = require('./planets.schema')

const isHabitablePlanet = (planet) => {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_prad'] < 1.6
  )
}

function loadPlanets() {
  return new Promise((resolve, reject) => {
    //יוצר סטרים שקורא את הנתונים מהקובץ csv.
    const csvPath = path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
    const stream = fs.createReadStream(csvPath).pipe(
      parse({
        comment: '#',
        columns: true,
      })
    )

    stream.on('data', async (planet) => {
      if (isHabitablePlanet(planet)) {
        savePlanet(planet)
      }
    })

    stream.on('end', async () => {
      const countPlanetsFound = await getAllPlanets()
      console.log(`got ${countPlanetsFound.length} planets`)
      resolve()
    })

    stream.on('error', (error) => {
      console.log({ err: error })
      reject(error)
    })
  })
}

async function getAllPlanets() {
  //Returns all planets without  the __v field.
  return await planets.find({}, 'keplerName')
}

async function savePlanet(planet) {
  try {
    const habitablePlanet = {
      keplerName: planet.kepler_name,
    }
    await planets.updateOne(habitablePlanet, habitablePlanet, { upsert: true })
  } catch (error) {
    console.log('Erorr saving planets: ', error)
  }
}

module.exports = {
  loadPlanets,
  getAllPlanets,
}
