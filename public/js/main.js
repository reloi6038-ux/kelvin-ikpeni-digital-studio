// public/js/main.js — Global site behavior
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initScrollProgress();
  initBackToTop();
  initRevealOnScroll();
  initMouseFollower();
  
  // Homepage specific
  if (document.getElementById('featured-projects-grid')) {
    loadFeaturedProjects();
    initTypewriter();
    initCountUp();
    init3DTilt();
  }
});

/* ---------------------------------------------------------
   THEME TOGGLE
   --------------------------------------------------------- */
function initTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
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
   DYNAMIC TYPEWRITER
   --------------------------------------------------------- */
function initTypewriter() {
  const target = document.getElementById('typewriter');
  if (!target) return;

  const sentences = [
    "crafting scalable backends with Node.js & MongoDB.",
    "building beautiful, responsive frontend interfaces.",
    "turning complex ideas into seamless digital realities."
  ];

  let sentenceIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 50;

  function type() {
    const currentSentence = sentences[sentenceIndex];
    
    if (isDeleting) {
      target.textContent = currentSentence.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 25; // Deletes faster
    } else {
      target.textContent = currentSentence.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 60; // Typing speed
    }

    // Logic for pausing and switching
    if (!isDeleting && charIndex === currentSentence.length) {
      typeSpeed = 2500; // Pause at the end of the sentence
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      sentenceIndex = (sentenceIndex + 1) % sentences.length;
      typeSpeed = 500; // Pause before typing the next sentence
    }

    setTimeout(type, typeSpeed);
  }

  setTimeout(type, 1000); // Start after 1 second
}

/* ---------------------------------------------------------
   COUNT UP STATS
   --------------------------------------------------------- */
function initCountUp() {
  const counters = document.querySelectorAll('.count-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const endValue = parseInt(target.getAttribute('data-target'));
        const suffix = target.getAttribute('data-suffix') || '';
        let currentValue = 0;
        const duration = 1500; // 1.5 seconds
        const increment = endValue / (duration / 16); // 60fps

        const updateCounter = () => {
          currentValue += increment;
          if (currentValue < endValue) {
            target.textContent = Math.ceil(currentValue) + suffix;
            requestAnimationFrame(updateCounter);
          } else {
            target.textContent = endValue + suffix;
          }
        };
        
        updateCounter();
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/* ---------------------------------------------------------
   3D TILT EFFECT (Vanilla JS)
   --------------------------------------------------------- */
function init3DTilt() {
  const cards = document.querySelectorAll('.project-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'none'; // Remove transition for smooth tracking
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      card.style.transition = 'transform 0.5s ease'; // Smooth reset
    });
  });
}

/* ---------------------------------------------------------
   MOUSE FOLLOWER
   --------------------------------------------------------- */
function initMouseFollower() {
  const follower = document.getElementById('mouse-follower');
  if (!follower) return;

  document.addEventListener('mousemove', (e) => {
    follower.style.left = `${e.clientX}px`;
    follower.style.top = `${e.clientY}px`;
  });
}

/* ---------------------------------------------------------
   OTHER GLOBAL BEHAVIORS
   --------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

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

function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

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

    // Re-initialize effects for the newly added cards
    initRevealOnScroll();
    init3DTilt();

  } catch (error) {
    console.error('Error:', error);
    grid.innerHTML = '<p style="color: #ef4444; grid-column: 1 / -1;">Failed to load projects. Please try again later.</p>';
  }
}