const request = require('supertest');
const app = require('../../app')
const { mongoConnect, mongoDisconnect } = require('../../services/mongo')

describe('Test Get planets', () => {
    beforeAll(async () => {
        await mongoConnect()
    })
    afterAll(async () => {
        await mongoDisconnect()
    })
    test('should respond with 200 OK status', async () => {
        await request(app)
            .get('/v1/planets')
            .expect('Content-Type', /json/)
            .expect(200)
    })
});
