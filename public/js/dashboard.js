/**
 * dashboard.js — Doctor Dashboard page logic
 * Load doctors for filter, load and display appointments with stats.
 */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  const doctorSelect = document.getElementById('doctorSelect');
  const appointmentsArea = document.getElementById('appointmentsArea');
  const refreshBtn = document.getElementById('refreshBtn');

  loadDoctorsForFilter();
  loadAppointments();

  doctorSelect.addEventListener('change', loadAppointments);
  refreshBtn.addEventListener('click', () => {
    refreshBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;"></span>';
    setTimeout(() => { refreshBtn.innerHTML = '↻ Refresh'; }, 300);
    loadAppointments();
  });

  async function loadDoctorsForFilter() {
    try {
      const res = await fetch('/api/doctors');
      const data = await res.json();
      if (data.success) {
        data.doctors.forEach(doc => {
          const option = document.createElement('option');
          option.value = doc.id;
          option.textContent = `${doc.name} — ${doc.specialization}`;
          doctorSelect.appendChild(option);
        });
      }
    } catch (err) { console.error('Failed to load doctors:', err); }
  }

  async function loadAppointments() {
    const doctorId = doctorSelect.value;
    let url = '/api/appointments';
    if (doctorId) url += `?doctorId=${doctorId}`;

    appointmentsArea.innerHTML = '<div class="loading-container"><div class="spinner"></div><span>Loading...</span></div>';

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.appointments.length > 0) {
        updateStats(data.appointments);
        renderAppointmentsTable(data.appointments);
      } else {
        updateStats([]);
        appointmentsArea.innerHTML = `
          <div class="empty-state">
            <div class="icon">📅</div>
            <h3>No appointments yet</h3>
            <p>Appointments booked by patients will appear here.</p>
            <a href="/doctors.html" class="btn btn-primary btn-sm" style="margin-top:16px;">Browse Doctors</a>
          </div>
        `;
      }
    } catch (err) {
      appointmentsArea.innerHTML = '<p style="color:var(--error);text-align:center;">Failed to load appointments.</p>';
    }
  }

  function updateStats(appointments) {
    const today = new Date().toISOString().split('T')[0];
    const total = appointments.length;
    const todayCount = appointments.filter(a => a.date === today).length;
    const upcoming = appointments.filter(a => a.date >= today).length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statToday').textContent = todayCount;
    document.getElementById('statUpcoming').textContent = upcoming;
  }

  function renderAppointmentsTable(appointments) {
    const today = new Date().toISOString().split('T')[0];
    const rows = appointments.map((a, i) => {
      const isPast = a.date < today;
      const statusClass = isPast ? 'pending' : 'confirmed';
      const statusText = isPast ? 'Past' : 'Confirmed';
      return `
        <tr style="animation: slideUp ${0.3 + i * 0.05}s ease;">
          <td><strong>${a.patientName}</strong></td>
          <td>${a.doctorName}</td>
          <td>${a.specialization}</td>
          <td>${a.date}</td>
          <td>${a.time}</td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td>${a.patientEmail || '—'}</td>
        </tr>
      `;
    }).join('');

    appointmentsArea.innerHTML = `
      <div class="appointments-table-wrapper" style="animation: slideUp 0.4s ease;">
        <table class="appointments-table">
          <thead>
            <tr>
              <th>Patient</th><th>Doctor</th><th>Specialization</th>
              <th>Date</th><th>Time</th><th>Status</th><th>Email</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p style="color:var(--text-muted);font-size:0.82rem;margin-top:12px;">
        Total: ${appointments.length} appointment${appointments.length > 1 ? 's' : ''}
      </p>
    `;
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
