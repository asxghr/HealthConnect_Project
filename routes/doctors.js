/**
 * routes/doctors.js
 * API routes for doctor listing and individual doctor profiles.
 */

const express = require('express');
const router = express.Router();
const doctors = require('../data/doctors.json');

/**
 * GET /api/doctors
 * Returns all doctors, with optional filtering by city and/or specialization.
 * Query params: ?city=Mumbai&specialization=Cardiologist
 */
router.get('/', (req, res) => {
  let results = [...doctors];
  const { city, specialization } = req.query;

  if (city) {
    results = results.filter(d => d.city.toLowerCase() === city.toLowerCase());
  }
  if (specialization) {
    results = results.filter(d => d.specialization.toLowerCase() === specialization.toLowerCase());
  }

  res.json({ success: true, count: results.length, doctors: results });
});

/**
 * GET /api/doctors/:id
 * Returns a single doctor by ID.
 */
router.get('/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === parseInt(req.params.id));

  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  res.json({ success: true, doctor });
});

module.exports = router;
