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

test('POST /api/bookings - books when no conflict', async () => {
  const v = await Vehicle.create({ name: 'Bookable', capacityKg: 1000, tyres: 6 });
  const res = await request(app).post('/api/bookings').send({
    vehicleId: v._id,
    fromPincode: '1000',
    toPincode: '1002', // duration 2
    startTime: '2025-09-21T09:00:00Z',
    customerId: 'cust-123'
  });

  expect(res.status).toBe(201);
  expect(res.body.vehicleId).toBe(String(v._id));
});

test('POST /api/bookings - returns 409 on overlapping booking', async () => {
  const v = await Vehicle.create({ name: 'Busy', capacityKg: 1000, tyres: 6 });

  // existing booking 10:00-12:00
  await Booking.create({
    vehicleId: v._id,
    fromPincode: '1000',
    toPincode: '1002',
    startTime: new Date('2025-09-21T10:00:00Z'),
    endTime: new Date('2025-09-21T12:00:00Z'),
    customerId: 'existing'
  });

  // attempt booking starting at 11:00 (duration 2 hours => 11:00-13:00) overlaps -> conflict
  const res = await request(app).post('/api/bookings').send({
    vehicleId: v._id,
    fromPincode: '1001',
    toPincode: '1003', // duration 2
    startTime: '2025-09-21T11:00:00Z',
    customerId: 'cust-new'
  });

  expect(res.status).toBe(409);
});
