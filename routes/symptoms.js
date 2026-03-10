/**
 * routes/symptoms.js
 * API route for symptom-based specialist recommendation.
 */

const express = require('express');
const router = express.Router();
const doctors = require('../data/doctors.json');
const { getRecommendation } = require('../utils/symptomMapper');

/**
 * POST /api/symptoms
 * Accepts an array of symptoms and returns the recommended specialist,
 * explanation, and matching doctors of that specialization.
 * Body: { "symptoms": ["fever", "cough", "headache"] }
 */
router.post('/', (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of symptoms, e.g. { "symptoms": ["fever", "cough"] }'
    });
  }

  // Get the recommendation from the symptom mapper
  const recommendation = getRecommendation(symptoms);

  // Find doctors matching the recommended specialization
  const matchingDoctors = doctors.filter(
    d => d.specialization.toLowerCase() === recommendation.specialization.toLowerCase()
  );

  res.json({
    success: true,
    recommendation: {
      specialization: recommendation.specialization,
      explanation: recommendation.explanation,
      matchedSymptoms: recommendation.matchedSymptoms,
      confidence: recommendation.confidence
    },
    doctors: matchingDoctors
  });
});

module.exports = router;
