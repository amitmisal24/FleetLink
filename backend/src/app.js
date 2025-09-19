const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const vehiclesRouter = require('./routes/vehicles');
const bookingsRouter = require('./routes/bookings');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/vehicles', vehiclesRouter);
app.use('/api/bookings', bookingsRouter);

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
