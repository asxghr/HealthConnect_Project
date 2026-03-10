/**
 * doctors.js — Doctor Directory page logic
 * Fetch, filter, search, sort, and render doctor cards with skeleton loading.
 */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  const cityFilter = document.getElementById('cityFilter');
  const specFilter = document.getElementById('specFilter');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const doctorGrid = document.getElementById('doctorGrid');
  const resultCount = document.getElementById('resultCount');
  const viewToggle = document.getElementById('viewToggle');

  let allDoctors = [];
  let currentView = 'grid';

  // Pre-fill filters from URL
  const params = new URLSearchParams(window.location.search);
  if (params.get('city')) cityFilter.value = params.get('city');
  if (params.get('specialization')) specFilter.value = params.get('specialization');

  // Load all doctors once, filter client-side for speed
  fetchDoctors();

  cityFilter.addEventListener('change', renderFiltered);
  specFilter.addEventListener('change', renderFiltered);
  sortSelect.addEventListener('change', renderFiltered);
  searchInput.addEventListener('input', renderFiltered);

  // View toggle
  viewToggle.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      viewToggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      doctorGrid.classList.toggle('list-view', currentView === 'list');
    });
  });

  async function fetchDoctors() {
    try {
      const res = await fetch('/api/doctors');
      const data = await res.json();
      if (data.success) {
        allDoctors = data.doctors;
        renderFiltered();
      }
    } catch (err) {
      doctorGrid.innerHTML = '<p style="color:var(--error); text-align:center;">Failed to load doctors.</p>';
    }
  }

  function renderFiltered() {
    const city = cityFilter.value;
    const spec = specFilter.value;
    const search = searchInput.value.toLowerCase().trim();
    const sort = sortSelect.value;

    let filtered = [...allDoctors];
    if (city) filtered = filtered.filter(d => d.city === city);
    if (spec) filtered = filtered.filter(d => d.specialization === spec);
    if (search) filtered = filtered.filter(d => d.name.toLowerCase().includes(search) || d.specialization.toLowerCase().includes(search));

    if (sort === 'experience') filtered.sort((a, b) => b.experience - a.experience);
    else if (sort === 'fee-low') filtered.sort((a, b) => a.fee - b.fee);
    else if (sort === 'fee-high') filtered.sort((a, b) => b.fee - a.fee);
    else if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

    if (filtered.length > 0) {
      resultCount.textContent = `Showing ${filtered.length} doctor${filtered.length > 1 ? 's' : ''}`;
      doctorGrid.innerHTML = filtered.map((doc, i) => createDoctorCard(doc, i)).join('');
    } else {
      resultCount.textContent = 'No doctors found';
      doctorGrid.innerHTML = `
        <div class="empty-state">
          <div class="icon">🔍</div>
          <h3>No doctors found</h3>
          <p>Try adjusting your filters to see more results.</p>
        </div>
      `;
    }
  }
});

function createDoctorCard(doc, index = 0) {
  const rating = Math.min(5, Math.round(doc.experience / 4));
  let stars = '<div class="rating-stars">';
  for (let i = 0; i < 5; i++) stars += `<span class="star ${i < rating ? '' : 'empty'}">${i < rating ? '★' : '☆'}</span>`;
  stars += '</div>';

  return `
    <div class="doctor-card" style="animation: slideUp ${0.3 + index * 0.06}s ease;">
      <div class="doctor-card-header">
        <img src="${doc.image}" alt="${doc.name}" class="doctor-avatar">
        <div class="doctor-info">
          <h3>${doc.name}</h3>
          <span class="specialization">${doc.specialization}</span>
          ${stars}
        </div>
      </div>
      <div class="doctor-card-body">
        <div class="doctor-meta">
          <span><span class="icon">📍</span> ${doc.city}</span>
          <span><span class="icon">⭐</span> ${doc.experience} yrs exp</span>
        </div>
        <div class="availability-tags">
          ${doc.availability.map(d => `<span class="availability-tag">${d}</span>`).join('')}
        </div>
      </div>
      <div class="doctor-card-footer">
        <span class="doctor-fee">₹${doc.fee} <span>/ visit</span></span>
        <a href="/doctor.html?id=${doc.id}" class="btn btn-primary btn-sm">View Profile</a>
      </div>
    </div>
  `;
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
