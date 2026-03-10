/**
 * routes/appointments.js
 * API routes for booking and viewing appointments.
 * Appointments are stored in-memory (resets on server restart).
 */

const express = require('express');
const router = express.Router();
const doctors = require('../data/doctors.json');

// In-memory appointment store
const appointments = [];
let nextId = 1;

/**
 * POST /api/appointments
 * Book a new appointment.
 * Body: { "doctorId": 1, "patientName": "John", "patientEmail": "john@example.com", "patientPhone": "9876543210", "date": "2026-03-15", "time": "10:00" }
 */
router.post('/', (req, res) => {
  const { doctorId, patientName, patientEmail, patientPhone, date, time } = req.body;

  // Validate required fields
  if (!doctorId || !patientName || !date || !time) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: doctorId, patientName, date, time'
    });
  }

  // Check the doctor exists
  const doctor = doctors.find(d => d.id === parseInt(doctorId));
  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  // Create appointment
  const appointment = {
    id: nextId++,
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialization: doctor.specialization,
    patientName,
    patientEmail: patientEmail || '',
    patientPhone: patientPhone || '',
    date,
    time,
    createdAt: new Date().toISOString()
  };

  appointments.push(appointment);

  res.status(201).json({
    success: true,
    message: `Appointment booked successfully with ${doctor.name}`,
    appointment
  });
});

/**
 * GET /api/appointments
 * List all appointments. Optional ?doctorId= filter for the doctor dashboard.
 */
router.get('/', (req, res) => {
  let results = [...appointments];
  const { doctorId } = req.query;

  if (doctorId) {
    results = results.filter(a => a.doctorId === parseInt(doctorId));
  }

  res.json({ success: true, count: results.length, appointments: results });
});

module.exports = router;
