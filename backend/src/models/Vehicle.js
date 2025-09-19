const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacityKg: { type: Number, required: true, min: 0 },
  tyres: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
