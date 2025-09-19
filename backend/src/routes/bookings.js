const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { estimatedRideDurationHours } = require('../utils/duration');

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const { vehicleId, fromPincode, toPincode, startTime, customerId } = req.body;
    if (!vehicleId || !fromPincode || !toPincode || !startTime || !customerId) {
      return res.status(400).json({ message: 'vehicleId, fromPincode, toPincode, startTime and customerId are required.' });
    }

    // verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });

    const start = new Date(startTime);
    if (isNaN(start.getTime())) return res.status(400).json({ message: 'startTime invalid.' });

    const durationHours = estimatedRideDurationHours(fromPincode, toPincode);
    const end = new Date(start.getTime() + durationHours * 3600 * 1000);

    // Re-verify no conflicting bookings for this vehicle in the window [start, end)
    const conflict = await Booking.findOne({
      vehicleId,
      startTime: { $lt: end },
      endTime: { $gt: start }
    }).lean();

    if (conflict) {
      return res.status(409).json({ message: 'Vehicle already booked for overlapping time slot.' });
    }

    // create booking
    const booking = new Booking({
      vehicleId,
      fromPincode,
      toPincode,
      startTime: start,
      endTime: end,
      customerId
    });

    await booking.save();
    return res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
