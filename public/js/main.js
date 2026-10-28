// public/js/main.js — Global site behavior & Featured Projects
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initScrollProgress();
  initBackToTop();
  initRevealOnScroll();
  
  // Only run on the homepage
  if (document.getElementById('featured-projects-grid')) {
    loadFeaturedProjects();
  }
});

/* ---------------------------------------------------------
   THEME TOGGLE (persists in localStorage)
   --------------------------------------------------------- */
function initTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  
  // DARK MODE IS THE DEFAULT (ignores system preferences)
  const initial = stored || 'dark'; 
  
  root.setAttribute('data-theme', initial);
  syncThemeButton(initial);

  document.addEventListener('click', (e) => {
    if (e.target.closest('.theme-toggle')) {
      const current = root.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      syncThemeButton(next);
    }
  });
}

function syncThemeButton(theme) {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = theme === 'light' ? '🌙' : '☀️';
    btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  });
}

/* ---------------------------------------------------------
   MOBILE NAVIGATION DRAWER
   --------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close drawer when a link is clicked
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('is-open')) {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}

/* ---------------------------------------------------------
   SCROLL PROGRESS BAR
   --------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = `${max > 0 ? (scrolled / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------------------------------------------------------
   BACK TO TOP
   --------------------------------------------------------- */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------------------------------------------------------
   REVEAL ON SCROLL (IntersectionObserver)
   --------------------------------------------------------- */
function initRevealOnScroll() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
}

/* ---------------------------------------------------------
   FEATURED PROJECTS (Homepage)
   --------------------------------------------------------- */
async function loadFeaturedProjects() {
  const grid = document.getElementById('featured-projects-grid');
  if (!grid) return;

  try {
    const response = await fetch('/api/projects/featured');
    const data = await response.json();

    if (!data.success) throw new Error('Failed to load projects');

    if (data.data.length === 0) {
      grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1;">No featured projects yet.</p>';
      return;
    }

    grid.innerHTML = '';

    data.data.forEach((project, index) => {
      const card = document.createElement('div');
      card.className = 'project-card reveal';
      card.style.transitionDelay = `${index * 0.15}s`;
      
      const techBadges = project.technologies.slice(0, 3).map(tech => 
        `<span class="tech-badge">${tech}</span>`
      ).join('');

      const imageUrl = project.thumbnailUrl || 'https://via.placeholder.com/600x400/1A1F2E/22D3EE?text=' + encodeURIComponent(project.name);

      card.innerHTML = `
        <div class="project-image">
          <img src="${imageUrl}" alt="${project.name}" loading="lazy" />
          <div class="project-overlay">
            <a href="/project-details?slug=${project.slug}" class="btn btn-primary">View Case Study</a>
          </div>
        </div>
        <div class="project-content">
          <span class="project-category">${project.category}</span>
          <h3>${project.name}</h3>
          <p>${project.shortDescription}</p>
          <div class="project-tech" style="margin-top: auto; padding-top: 1rem;">${techBadges}</div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Re-trigger the reveal observer for the newly added cards
    initRevealOnScroll();

  } catch (error) {
    console.error('Error:', error);
    grid.innerHTML = '<p style="color: #ef4444; grid-column: 1 / -1;">Failed to load projects. Please try again later.</p>';
  }
}