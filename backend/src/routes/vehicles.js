const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { estimatedRideDurationHours } = require('../utils/duration');

// POST /api/vehicles
router.post('/', async (req, res) => {
  try {
    const { name, capacityKg, tyres } = req.body;
    if (!name || capacityKg === undefined || tyres === undefined) {
      return res.status(400).json({ message: 'name, capacityKg and tyres are required.' });
    }
    if (typeof capacityKg !== 'number' || typeof tyres !== 'number') {
      return res.status(400).json({ message: 'capacityKg and tyres must be numbers.' });
    }
    const vehicle = new Vehicle({ name, capacityKg, tyres });
    await vehicle.save();
    return res.status(201).json(vehicle);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/vehicles/available
// Query params: capacityRequired, fromPincode, toPincode, startTime (ISO)
router.get('/available', async (req, res) => {
  try {
    const { capacityRequired, fromPincode, toPincode, startTime } = req.query;
    if (!capacityRequired || !fromPincode || !toPincode || !startTime) {
      return res.status(400).json({ message: 'capacityRequired, fromPincode, toPincode and startTime are required.' });
    }

    const capacity = Number(capacityRequired);
    if (Number.isNaN(capacity)) return res.status(400).json({ message: 'capacityRequired must be a number.' });

    const start = new Date(startTime);
    if (isNaN(start.getTime())) return res.status(400).json({ message: 'startTime invalid.' });

    const durationHours = estimatedRideDurationHours(fromPincode, toPincode);
    const end = new Date(start.getTime() + durationHours * 3600 * 1000);

    // Find vehicles that meet capacity
    const vehicles = await Vehicle.find({ capacityKg: { $gte: capacity } }).lean();

    // For each vehicle, check whether any booking exists that overlaps [start, end)
    const available = [];
    for (const v of vehicles) {
      const hasConflict = await Booking.exists({
        vehicleId: v._id,
        $expr: {
          $and: [
            { $lt: ["$startTime", end] },
            { $gt: ["$endTime", start] }
          ]
        }
      });
      // If Booking.exists with $expr is not supported by certain mongoose versions, fallback:
      let conflict = false;
      if (hasConflict) conflict = true;

      // Fallback (robust) query when $expr is not supported or to be safe:
      if (!conflict) {
        const q = await Booking.findOne({
          vehicleId: v._id,
          startTime: { $lt: end },
          endTime: { $gt: start }
        }).lean();
        if (q) conflict = true;
      }

      if (!conflict) {
        available.push({
          ...v,
          estimatedRideDurationHours: durationHours
        });
      }
    }

    return res.status(200).json(available);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
