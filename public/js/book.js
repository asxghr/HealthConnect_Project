/**
 * book.js — Appointment Booking page logic
 * Load doctor info, handle form, submit booking, confetti, step wizard.
 */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  const bookingContent = document.getElementById('bookingContent');
  const confirmModal = document.getElementById('confirmModal');
  const confirmMessage = document.getElementById('confirmMessage');
  const params = new URLSearchParams(window.location.search);
  const doctorId = params.get('doctorId');

  if (!doctorId) {
    bookingContent.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><h3>No doctor selected</h3><p><a href="/doctors.html" class="btn btn-primary btn-sm" style="margin-top:12px;">Browse Doctors</a></p></div>';
    return;
  }

  // Step 1 done (doctor selected)
  setBookingStep(2);
  loadDoctorInfo(doctorId);

  function setBookingStep(step) {
    ['bStep1', 'bStep2', 'bStep3'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('active', 'done');
      if (i + 1 < step) el.classList.add('done');
      else if (i + 1 === step) el.classList.add('active');
    });
    ['bLine1', 'bLine2'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('done', i + 1 < step);
    });
  }

  async function loadDoctorInfo(id) {
    try {
      const res = await fetch(`/api/doctors/${id}`);
      const data = await res.json();
      if (data.success) renderBookingForm(data.doctor);
      else bookingContent.innerHTML = '<div class="empty-state"><div class="icon">😕</div><h3>Doctor not found</h3></div>';
    } catch (err) {
      bookingContent.innerHTML = '<p style="color:var(--error);text-align:center;">Failed to load doctor info.</p>';
    }
  }

  function renderBookingForm(doc) {
    const today = new Date().toISOString().split('T')[0];
    bookingContent.innerHTML = `
      <div class="booking-layout" style="animation: slideUp 0.5s ease;">
        <div class="booking-doctor-info">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
            <img src="${doc.image}" alt="${doc.name}" class="doctor-avatar" style="width:56px;height:56px;">
            <div>
              <h2>${doc.name}</h2>
              <span class="specialization">${doc.specialization}</span>
            </div>
          </div>
          <div class="meta-list">
            <div class="meta-item"><span class="icon">📍</span> ${doc.address}</div>
            <div class="meta-item"><span class="icon">⭐</span> ${doc.experience} years of experience</div>
            <div class="meta-item"><span class="icon">💰</span> Consultation fee: ₹${doc.fee}</div>
            <div class="meta-item"><span class="icon">📅</span> Available: ${doc.availability.join(', ')}</div>
          </div>
        </div>
        <div class="booking-form-card">
          <h2>Your Details</h2>
          <form id="bookingForm">
            <input type="hidden" name="doctorId" value="${doc.id}">
            <div class="form-group">
              <label for="patientName">Full Name *</label>
              <input type="text" class="form-control" id="patientName" name="patientName" required placeholder="Enter your full name">
            </div>
            <div class="form-group">
              <label for="patientEmail">Email Address</label>
              <input type="email" class="form-control" id="patientEmail" name="patientEmail" placeholder="you@example.com">
            </div>
            <div class="form-group">
              <label for="patientPhone">Phone Number</label>
              <input type="tel" class="form-control" id="patientPhone" name="patientPhone" placeholder="9876543210">
            </div>
            <div class="form-group">
              <label for="appointmentDate">Preferred Date *</label>
              <input type="date" class="form-control" id="appointmentDate" name="date" required min="${today}">
            </div>
            <div class="form-group">
              <label for="appointmentTime">Preferred Time *</label>
              <select class="form-control" id="appointmentTime" name="time" required>
                <option value="">Select a time slot</option>
                <option value="09:00">09:00 AM</option><option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option><option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option><option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option><option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option><option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option><option value="16:00">04:00 PM</option>
                <option value="16:30">04:30 PM</option><option value="17:00">05:00 PM</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:8px;" id="submitBtn">
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('bookingForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span> Booking...';

      const formData = {
        doctorId: doc.id,
        patientName: document.getElementById('patientName').value,
        patientEmail: document.getElementById('patientEmail').value,
        patientPhone: document.getElementById('patientPhone').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value
      };

      try {
        const res = await fetch('/api/appointments', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setBookingStep(3);
          confirmMessage.textContent = `Your appointment with ${doc.name} on ${formData.date} at ${formData.time} has been confirmed.`;
          confirmModal.classList.add('active');
          launchConfetti();
        } else {
          alert(data.message || 'Booking failed. Please try again.');
        }
      } catch (err) {
        alert('Something went wrong. Please try again.');
      }
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Confirm Booking';
    });
  }
});

function launchConfetti() {
  const colors = ['#6C5CE7', '#A29BFE', '#00CEC9', '#81ECEC', '#FD79A8', '#FDCB6E', '#00B894', '#55EFC4'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      top: -10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${Math.random() * 2 + 1.5}s;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

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
