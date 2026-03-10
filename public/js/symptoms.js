/**
 * symptoms.js — Symptom Checker page logic
 * Manage symptom tags, step progress, call API, display results.
 */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  const symptomTags = document.getElementById('symptomTags');
  const symptomInput = document.getElementById('symptomInput');
  const addSymptomBtn = document.getElementById('addSymptomBtn');
  const checkBtn = document.getElementById('checkSymptomsBtn');
  const resultArea = document.getElementById('symptomResult');

  let symptoms = [];

  function addSymptom(symptom) {
    const normalized = symptom.toLowerCase().trim();
    if (!normalized || symptoms.includes(normalized)) return;
    symptoms.push(normalized);
    renderTags();
    symptomInput.value = '';
    checkBtn.disabled = symptoms.length === 0;
    // Mark quick-add button as selected
    document.querySelectorAll('.quick-symptom-btn').forEach(btn => {
      btn.classList.toggle('selected', symptoms.includes(btn.dataset.symptom));
    });
  }

  function removeSymptom(symptom) {
    symptoms = symptoms.filter(s => s !== symptom);
    renderTags();
    checkBtn.disabled = symptoms.length === 0;
    document.querySelectorAll('.quick-symptom-btn').forEach(btn => {
      btn.classList.toggle('selected', symptoms.includes(btn.dataset.symptom));
    });
  }

  function renderTags() {
    symptomTags.innerHTML = symptoms.map(s => `
      <span class="symptom-tag">
        ${s}
        <span class="remove-tag" data-symptom="${s}">✕</span>
      </span>
    `).join('');
    symptomTags.querySelectorAll('.remove-tag').forEach(btn => {
      btn.addEventListener('click', () => removeSymptom(btn.dataset.symptom));
    });
  }

  addSymptomBtn.addEventListener('click', () => addSymptom(symptomInput.value));
  symptomInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSymptom(symptomInput.value);
  });

  document.querySelectorAll('.quick-symptom-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (symptoms.includes(btn.dataset.symptom)) {
        removeSymptom(btn.dataset.symptom);
      } else {
        addSymptom(btn.dataset.symptom);
      }
    });
  });

  // Step progress updates
  function setStep(step) {
    ['step1', 'step2', 'step3'].forEach((id, i) => {
      const el = document.getElementById(id);
      el.classList.remove('active', 'done');
      if (i + 1 < step) el.classList.add('done');
      else if (i + 1 === step) el.classList.add('active');
    });
    ['line1', 'line2'].forEach((id, i) => {
      document.getElementById(id).classList.toggle('done', i + 1 < step);
    });
  }

  checkBtn.addEventListener('click', async () => {
    if (symptoms.length === 0) return;
    checkBtn.disabled = true;
    checkBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span> Analyzing...';
    setStep(2);

    try {
      const res = await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms })
      });
      const data = await res.json();
      if (data.success) {
        setStep(3);
        displayResult(data);
      } else {
        setStep(1);
        resultArea.innerHTML = `<div class="symptom-result"><p style="color:var(--error);">${data.message}</p></div>`;
        resultArea.style.display = 'block';
      }
    } catch (err) {
      setStep(1);
      resultArea.innerHTML = `<div class="symptom-result"><p style="color:var(--error);">Something went wrong. Please try again.</p></div>`;
      resultArea.style.display = 'block';
    }
    checkBtn.disabled = false;
    checkBtn.innerHTML = '🔍 Find Specialist';
  });

  function displayResult(data) {
    const { recommendation, doctors } = data;
    const doctorCards = doctors.map((doc, i) => `
      <div class="doctor-card" style="animation: slideUp ${0.4 + i * 0.08}s ease;">
        <div class="doctor-card-header">
          <img src="${doc.image}" alt="${doc.name}" class="doctor-avatar">
          <div class="doctor-info">
            <h3>${doc.name}</h3>
            <span class="specialization">${doc.specialization}</span>
          </div>
        </div>
        <div class="doctor-card-body">
          <div class="doctor-meta">
            <span><span class="icon">📍</span> ${doc.city}</span>
            <span><span class="icon">⭐</span> ${doc.experience} yrs exp</span>
          </div>
        </div>
        <div class="doctor-card-footer">
          <span class="doctor-fee">₹${doc.fee} <span>/ visit</span></span>
          <a href="/book.html?doctorId=${doc.id}" class="btn btn-primary btn-sm">Book Now</a>
        </div>
      </div>
    `).join('');

    resultArea.innerHTML = `
      <div class="symptom-result">
        <div class="result-header">
          <div class="result-icon">🏥</div>
          <div>
            <h2>Recommended: ${recommendation.specialization}
              <span class="confidence-badge ${recommendation.confidence}">${recommendation.confidence} confidence</span>
            </h2>
          </div>
        </div>
        <p class="result-explanation">${recommendation.explanation}</p>
        ${recommendation.matchedSymptoms.length > 0 ? `
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:24px;">
            <strong>Matched symptoms:</strong> ${recommendation.matchedSymptoms.join(', ')}
          </p>
        ` : ''}
        <h3 class="result-doctors-title">Available ${recommendation.specialization}s</h3>
        <div class="doctor-grid" style="grid-template-columns: 1fr;">
          ${doctorCards || '<p style="color:var(--text-muted);">No doctors of this specialization currently available.</p>'}
        </div>
      </div>
    `;
    resultArea.style.display = 'block';
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Pre-fill from URL query
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (query) {
    query.split(',').forEach(s => addSymptom(s.trim()));
    setTimeout(() => checkBtn.click(), 500);
  }
});

function initTheme() {
  const saved = localStorage.getItem('hc-theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  const toggles = document.querySelectorAll('#themeToggle');
  toggles.forEach(toggle => {
    toggle.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
    toggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
      localStorage.setItem('hc-theme', isDark ? 'light' : 'dark');
      document.querySelectorAll('#themeToggle').forEach(t => t.textContent = isDark ? '🌙' : '☀️');
    });
  });
}
