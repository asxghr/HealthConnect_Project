/**
 * server.js
 * HealthConnect — Express server entry point.
 * Serves static frontend files and mounts API route modules.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import route modules
const doctorsRouter = require('./routes/doctors');
const symptomsRouter = require('./routes/symptoms');
const appointmentsRouter = require('./routes/appointments');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// --- Mount API routes ---
app.use('/api/doctors', doctorsRouter);
app.use('/api/symptoms', symptomsRouter);
app.use('/api/appointments', appointmentsRouter);

// --- Fallback: serve index.html for any unmatched route ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🏥 HealthConnect server running at http://localhost:${PORT}`);
});
