/**
 * doctor.js — Doctor Profile page logic
 * Fetch doctor by ID, render profile with rating stars, share button, dark mode.
 */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  const profileContent = document.getElementById('profileContent');
  const params = new URLSearchParams(window.location.search);
  const doctorId = params.get('id');

  if (!doctorId) {
    profileContent.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><h3>No doctor selected</h3><p><a href="/doctors.html" class="btn btn-primary btn-sm" style="margin-top:12px;">Browse Doctors</a></p></div>';
    return;
  }

  loadDoctorProfile(doctorId);

  async function loadDoctorProfile(id) {
    try {
      const res = await fetch(`/api/doctors/${id}`);
      const data = await res.json();
      if (data.success) {
        renderProfile(data.doctor);
        document.title = `${data.doctor.name} — HealthConnect`;
      } else {
        profileContent.innerHTML = '<div class="empty-state"><div class="icon">😕</div><h3>Doctor not found</h3><p><a href="/doctors.html" class="btn btn-primary btn-sm" style="margin-top:12px;">Browse Doctors</a></p></div>';
      }
    } catch (err) {
      profileContent.innerHTML = '<p style="color:var(--error);text-align:center;">Failed to load doctor profile.</p>';
    }
  }

  function renderProfile(doc) {
    const rating = Math.min(5, Math.round(doc.experience / 4));
    let stars = '';
    for (let i = 0; i < 5; i++) stars += `<span class="star ${i < rating ? '' : 'empty'}">${i < rating ? '★' : '☆'}</span>`;

    profileContent.innerHTML = `
      <div class="profile-card" style="animation: slideUp 0.5s ease;">
        <div class="profile-header">
          <img src="${doc.image}" alt="${doc.name}" class="profile-avatar">
          <div>
            <h1>${doc.name}</h1>
            <p class="specialization">${doc.specialization}</p>
            <div class="rating-stars" style="margin-top:6px;">${stars}</div>
          </div>
          <button class="share-btn" onclick="shareProfile()" style="margin-left:auto;">📤 Share</button>
        </div>
        <div class="profile-body">
          <div class="profile-section">
            <h2>📋 About</h2>
            <p>${doc.bio}</p>
          </div>
          <div class="profile-details-grid">
            <div class="profile-detail">
              <label>Experience</label>
              <span>${doc.experience} Years</span>
            </div>
            <div class="profile-detail">
              <label>Consultation Fee</label>
              <span>₹${doc.fee}</span>
            </div>
            <div class="profile-detail">
              <label>City</label>
              <span>${doc.city}</span>
            </div>
            <div class="profile-detail">
              <label>Availability</label>
              <span>${doc.availability.join(', ')}</span>
            </div>
          </div>
          <div class="profile-section" style="margin-top: 28px;">
            <h2>📍 Clinic Address</h2>
            <p>${doc.address}</p>
          </div>
          <div style="text-align: center; margin-top: 36px;">
            <a href="/book.html?doctorId=${doc.id}" class="btn btn-primary btn-lg">📅 Book Appointment</a>
          </div>
        </div>
      </div>
    `;
  }
});

function shareProfile() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const toast = document.getElementById('toast');
    toast.textContent = '✅ Profile link copied to clipboard!';
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
  }).catch(() => {
    const toast = document.getElementById('toast');
    toast.textContent = '📋 Copy this URL to share the profile';
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
  });
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
