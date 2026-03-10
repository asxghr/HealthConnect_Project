/**
 * symptomMapper.js
 * Maps user-reported symptoms to the appropriate medical specialist.
 * Each entry includes the specialist type, matching symptom keywords,
 * and a human-readable explanation for the recommendation.
 */

const symptomMap = [
  {
    specialization: "General Physician",
    symptoms: ["fever", "cold", "cough", "fatigue", "body ache", "weakness", "flu", "malaise", "chills", "sore throat", "nausea", "vomiting", "diarrhea"],
    explanation: "These symptoms are commonly associated with general infections or viral illnesses. A General Physician can diagnose and treat a wide range of common health issues."
  },
  {
    specialization: "Cardiologist",
    symptoms: ["chest pain", "heart palpitations", "shortness of breath", "high blood pressure", "dizziness", "swollen ankles", "irregular heartbeat"],
    explanation: "These symptoms may be related to cardiovascular conditions. A Cardiologist specializes in diagnosing and treating heart and blood vessel disorders."
  },
  {
    specialization: "Dermatologist",
    symptoms: ["rash", "acne", "itching", "skin irritation", "eczema", "hair loss", "dry skin", "blisters", "moles", "pigmentation"],
    explanation: "Skin-related symptoms require evaluation by a Dermatologist, who specializes in conditions affecting the skin, hair, and nails."
  },
  {
    specialization: "Orthopedic Surgeon",
    symptoms: ["joint pain", "back pain", "knee pain", "fracture", "bone pain", "swelling in joints", "stiffness", "sprain", "shoulder pain", "neck pain"],
    explanation: "Bone, joint, and muscle-related symptoms are best evaluated by an Orthopedic Surgeon who specializes in the musculoskeletal system."
  },
  {
    specialization: "Pediatrician",
    symptoms: ["child fever", "child cough", "baby rash", "growth issues", "vaccination", "child stomach ache", "infant feeding problems"],
    explanation: "For children's health concerns, a Pediatrician is the right specialist. They are trained in diagnosing and treating illnesses in infants, children, and adolescents."
  },
  {
    specialization: "ENT Specialist",
    symptoms: ["ear pain", "hearing loss", "tinnitus", "nasal congestion", "sinusitis", "snoring", "tonsillitis", "voice hoarseness", "throat infection"],
    explanation: "Ear, nose, and throat symptoms are best handled by an ENT Specialist who can diagnose and treat conditions of these interconnected areas."
  },
  {
    specialization: "Neurologist",
    symptoms: ["headache", "migraine", "seizures", "numbness", "tingling", "memory loss", "tremors", "vertigo", "paralysis", "brain fog"],
    explanation: "Neurological symptoms involve the brain, spinal cord, and nervous system. A Neurologist can perform specialized tests and provide targeted treatment."
  },
  {
    specialization: "Psychiatrist",
    symptoms: ["anxiety", "depression", "insomnia", "stress", "panic attacks", "mood swings", "hallucinations", "addiction", "mental fatigue"],
    explanation: "Mental health concerns are treated by a Psychiatrist, who can provide both therapy guidance and medication management for psychological conditions."
  },
  {
    specialization: "Gynecologist",
    symptoms: ["menstrual pain", "irregular periods", "pregnancy", "pelvic pain", "breast pain", "hormonal imbalance", "vaginal discharge"],
    explanation: "Women's reproductive health issues are addressed by a Gynecologist, who specializes in female reproductive system conditions and pregnancy care."
  }
];

/**
 * Analyzes an array of symptom strings and recommends the best matching specialist.
 * @param {string[]} symptoms - Array of symptom keywords from the user.
 * @returns {{ specialization, explanation, matchedSymptoms, confidence }}
 */
function getRecommendation(symptoms) {
  // Normalize user symptoms to lowercase
  const normalized = symptoms.map(s => s.toLowerCase().trim());

  // Score each specialization by how many symptoms match
  const scores = symptomMap.map(entry => {
    const matchedSymptoms = [];
    normalized.forEach(userSymptom => {
      entry.symptoms.forEach(knownSymptom => {
        if (knownSymptom.includes(userSymptom) || userSymptom.includes(knownSymptom)) {
          if (!matchedSymptoms.includes(knownSymptom)) {
            matchedSymptoms.push(knownSymptom);
          }
        }
      });
    });
    return {
      specialization: entry.specialization,
      explanation: entry.explanation,
      matchedSymptoms,
      score: matchedSymptoms.length
    };
  });

  // Sort by score descending; pick the top match
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  if (best.score === 0) {
    return {
      specialization: "General Physician",
      explanation: "We couldn't find a strong match for your symptoms. We recommend visiting a General Physician for an initial evaluation, who can then refer you to the right specialist if needed.",
      matchedSymptoms: [],
      confidence: "low"
    };
  }

  return {
    specialization: best.specialization,
    explanation: best.explanation,
    matchedSymptoms: best.matchedSymptoms,
    confidence: best.score >= 3 ? "high" : best.score >= 2 ? "medium" : "low"
  };
}

module.exports = { getRecommendation, symptomMap };
