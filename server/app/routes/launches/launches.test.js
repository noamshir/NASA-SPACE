const request = require('supertest')
const app = require('../../app')
const { loadPlanets } = require('../../model/planets.model')
const { mongoConnect, mongoDisconnect } = require('../../services/mongo')

describe('Test Launches API', () => {
  beforeAll(async () => {
    await mongoConnect()
    await loadPlanets()
  })

  afterAll(async () => {
    await mongoDisconnect()
  })

  describe('Test Get /launches', () => {
    test('should respond with 200 success', async () => {
      await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200)
    })
  })

  describe('Test Post /launches', () => {
    const validLaunchData = {
      mission: 'Test Mission',
      rocket: 'ZTM IS 35',
      target: 'Kepler-62 f',
      launchDate: 'January 17, 2030',
    }

    const launchDataWithoutDate = {
      mission: 'Test Misson',
      rocket: 'ZTM IS 35',
      target: 'Kepler-62 f',
    }

    const launchDataWithInvalidDate = {
      mission: 'Test Misson',
      rocket: 'ZTM IS 35',
      target: 'Kepler-62 f',
      launchDate: 'test',
    }

    test('should respond with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(validLaunchData)
        .expect('Content-Type', /json/)
        .expect(201)

      const requestDate = new Date(validLaunchData.launchDate).valueOf()
      const responseDate = new Date(response.body.launchDate).valueOf()
      expect(responseDate).toBe(requestDate)
    })

    test('should catch missing properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      })
    })

    test('should catch invalid launch date', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).toStrictEqual({
        error: 'Invalid Date provided',
      })
    })
  })
})
