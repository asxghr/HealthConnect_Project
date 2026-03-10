/**
 * main.js — Landing page logic
 * Navbar scroll, mobile menu, featured doctors, hero search, particles, counters, dark mode.
 */
document.addEventListener('DOMContentLoaded', () => {

  // --- Theme toggle ---
  initTheme();

  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // --- Mobile nav toggle ---
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  // --- Fade-in on scroll with stagger ---
  const fadeEls = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
      }
    });
  }, { threshold: 0.15 });
  fadeEls.forEach(el => observer.observe(el));

  // --- Hero particles ---
  createParticles();

  // --- Animated counters ---
  animateCounters();

  // --- Load featured doctors ---
  loadFeaturedDoctors();

  // --- Hero search ---
  const heroSearchInput = document.getElementById('heroSearchInput');
  const heroSearchBtn = document.getElementById('heroSearchBtn');
  heroSearchBtn.addEventListener('click', () => {
    const query = heroSearchInput.value.trim();
    if (query) window.location.href = `/symptoms.html?q=${encodeURIComponent(query)}`;
  });
  heroSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') heroSearchBtn.click();
  });

  // --- Ripple effect on buttons ---
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      btn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    }
  });
});

/** Create floating particles in the hero */
function createParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  const colors = ['#6C5CE7', '#A29BFE', '#00CEC9', '#81ECEC', '#FD79A8', '#FDCB6E'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 8 + 3;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: ${Math.random() * 0.4 + 0.1};
    `;
    container.appendChild(p);
  }
}

/** Animate number counters */
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = current + (target > 20 ? '/7' : '+');
          if (target === 5) el.textContent = current;
          if (target === 24) el.textContent = current + '/7';
          else if (target <= 20) el.textContent = current + '+';
        }, 35);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

/** Load featured doctors */
async function loadFeaturedDoctors() {
  const grid = document.getElementById('featuredDoctorsGrid');
  try {
    const res = await fetch('/api/doctors');
    const data = await res.json();
    if (data.success && data.doctors.length > 0) {
      const featured = data.doctors.sort((a, b) => b.experience - a.experience).slice(0, 6);
      grid.innerHTML = featured.map((doc, i) => createDoctorCard(doc, i)).join('');
    } else {
      grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);">No doctors found.</p>';
    }
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center;color:var(--error);">Failed to load doctors.</p>';
  }
}

function createDoctorCard(doc, index = 0) {
  const stars = renderStars(doc.experience);
  return `
    <div class="doctor-card fade-in visible" style="animation: slideUp ${0.4 + index * 0.08}s ease;">
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

function renderStars(experience) {
  const rating = Math.min(5, Math.round(experience / 4));
  let html = '<div class="rating-stars">';
  for (let i = 0; i < 5; i++) {
    html += `<span class="star ${i < rating ? '' : 'empty'}">${i < rating ? '★' : '☆'}</span>`;
  }
  return html + '</div>';
}

/** Dark mode */
function initTheme() {
  const saved = localStorage.getItem('hc-theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  const toggles = document.querySelectorAll('#themeToggle');
  toggles.forEach(toggle => {
    updateToggleIcon(toggle);
    toggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
      localStorage.setItem('hc-theme', isDark ? 'light' : 'dark');
      document.querySelectorAll('#themeToggle').forEach(t => updateToggleIcon(t));
    });
  });
}

function updateToggleIcon(toggle) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  toggle.textContent = isDark ? '☀️' : '🌙';
}
