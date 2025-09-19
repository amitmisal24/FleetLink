const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Vehicle = require('../src/models/Vehicle');
const Booking = require('../src/models/Booking');

let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Vehicle.deleteMany({});
  await Booking.deleteMany({});
});

test('POST /api/vehicles - creates vehicle and validates input', async () => {
  const res = await request(app).post('/api/vehicles').send({
    name: 'Truck A',
    capacityKg: 1000,
    tyres: 6
  });
  expect(res.status).toBe(201);
  expect(res.body.name).toBe('Truck A');

  // invalid
  const res2 = await request(app).post('/api/vehicles').send({ name: 'X' });
  expect(res2.status).toBe(400);
});

test('GET /api/vehicles/available - filters by capacity and overlapping bookings', async () => {
  // create vehicles
  const v1 = await Vehicle.create({ name: 'V1', capacityKg: 500, tyres: 4 });
  const v2 = await Vehicle.create({ name: 'V2', capacityKg: 2000, tyres: 6 });

  // booking on v2 that overlaps a future query
  const start = new Date('2025-09-20T10:00:00Z');
  const durationHours = 2; // we'll create a booking of 2 hours
  const end = new Date(start.getTime() + durationHours * 3600 * 1000);

  await Booking.create({
    vehicleId: v2._id,
    fromPincode: '1000',
    toPincode: '1002',
    startTime: start,
    endTime: end,
    customerId: 'cust1'
  });

  // query for capacityRequired 400, from 1001 to 1003 -> duration = |1003-1001|%24 = 2 hours
  const queryStart = new Date('2025-09-20T11:00:00Z').toISOString();
  const res = await request(app)
    .get('/api/vehicles/available')
    .query({
      capacityRequired: 400,
      fromPincode: '1001',
      toPincode: '1003',
      startTime: queryStart
    });

  expect(res.status).toBe(200);
  // v1 capacity 500 >= 400 -> available (no booking)
  // v2 capacity 2000 >= 400 BUT booking exists that overlaps 11:00-13:00 vs existing 10:00-12:00 -> overlap -> excluded
  const names = res.body.map(v => v.name);
  expect(names).toContain('V1');
  expect(names).not.toContain('V2');
});
