// public/js/portfolio.js
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  const categoryFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');
  const sortFilter = document.getElementById('sort-filter');
  const resultsCount = document.getElementById('results-count');
  const viewGridBtn = document.getElementById('view-grid');
  const viewListBtn = document.getElementById('view-list');

  let allProjects = [];
  let currentView = 'grid';

  // Initial Load
  init();

  async function init() {
    await loadCategories();
    await fetchProjects();
    initFilters();
  }

  function initFilters() {
    categoryFilter.addEventListener('change', () => fetchProjects());
    sortFilter.addEventListener('change', () => fetchProjects());
    
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fetchProjects(), 400);
    });

    // View Toggles
    viewGridBtn.addEventListener('click', () => toggleView('grid'));
    viewListBtn.addEventListener('click', () => toggleView('list'));
  }

  function toggleView(type) {
    currentView = type;
    if (type === 'grid') {
      grid.classList.remove('list-view');
      grid.classList.add('projects-grid');
      viewGridBtn.classList.add('active');
      viewListBtn.classList.remove('active');
    } else {
      grid.classList.remove('projects-grid');
      grid.classList.add('list-view');
      viewListBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
    }
    renderProjects(allProjects);
  }

  async function loadCategories() {
    try {
      const res = await fetch('/api/projects/categories');
      const data = await res.json();
      if (data.success) {
        data.data.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat;
          option.textContent = cat;
          categoryFilter.appendChild(option);
        });
      }
    } catch (err) { console.error('Categories error:', err); }
  }

  async function fetchProjects() {
    const category = categoryFilter.value;
    const search = searchInput.value;
    const sort = sortFilter.value;
    
    // Show loading state (optional: you could show skeletons again here)
    grid.style.opacity = '0.5';

    try {
      const url = new URL('/api/projects', window.location.origin);
      if (category && category !== 'All') url.searchParams.append('category', category);
      if (search) url.searchParams.append('search', search);
      if (sort) url.searchParams.append('sort', sort);
      url.searchParams.append('limit', '100'); // Fetch a large batch for client-side display

      const response = await fetch(url);
      const data = await response.json();

      allProjects = data.data;
      renderProjects(allProjects);

    } catch (error) {
      console.error('Error:', error);
      grid.innerHTML = '<p style="color: #ef4444; text-align: center; width: 100%;">Error loading projects. Please try again.</p>';
    } finally {
      grid.style.opacity = '1';
    }
  }

  function renderProjects(projects) {
    grid.innerHTML = '';

    if (projects.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <h3 style="font-size: 2rem; margin-bottom: 1rem;">No projects found</h3>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">We couldn't find any projects matching your criteria.</p>
          <button onclick="resetFilters()" class="btn btn-primary">Clear Filters</button>
        </div>
      `;
      resultsCount.textContent = `Showing 0 projects`;
      return;
    }

    resultsCount.textContent = `Showing ${projects.length} project${projects.length === 1 ? '' : 's'}`;

    projects.forEach((project, index) => {
      const card = document.createElement('div');
      card.className = currentView === 'grid' ? 'project-card reveal' : 'project-card list-card reveal';
      card.style.transitionDelay = `${index * 0.05}s`; // Faster stagger
      
      const techBadges = project.technologies.slice(0, 3).map(tech => 
        `<span class="tech-badge">${tech}</span>`
      ).join('');

      // Fallback SVG image
      const fallbackImg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1A1F2E"/>
          <text x="50%" y="50%" fill="#22D3EE" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle">${project.name}</text>
        </svg>
      `)}`;
      
      const imageUrl = project.thumbnailUrl || fallbackImg;

      if (currentView === 'grid') {
        card.innerHTML = `
          <div class="project-image">
            <img src="${imageUrl}" alt="${project.name}" loading="lazy" />
            <div class="project-overlay">
              <a href="/project-details?slug=${project.slug}" class="btn btn-primary">View Details</a>
            </div>
          </div>
          <div class="project-content">
            <span class="project-category">${project.category}</span>
            <h3>${project.name}</h3>
            <p>${project.shortDescription}</p>
            <div class="project-tech" style="margin-top: auto; padding-top: 1rem;">${techBadges}</div>
          </div>
        `;
      } else {
        // List View Layout
        card.innerHTML = `
          <div class="project-image" style="height: 100%; min-height: 200px;">
            <img src="${imageUrl}" alt="${project.name}" loading="lazy" />
          </div>
          <div class="project-content">
            <span class="project-category">${project.category}</span>
            <h3 style="font-size: 1.5rem;">${project.name}</h3>
            <p style="margin-bottom: 1.5rem;">${project.shortDescription}</p>
            <div class="project-tech" style="margin-bottom: 1.5rem;">${techBadges}</div>
            <a href="/project-details?slug=${project.slug}" class="btn btn-primary" style="align-self: flex-start;">View Case Study</a>
          </div>
        `;
      }

      grid.appendChild(card);
    });

    // Re-trigger animations and 3D effects
    if (typeof initRevealOnScroll === 'function') initRevealOnScroll();
    if (typeof init3DTilt === 'function' && currentView === 'grid') init3DTilt();
  }

  // Expose reset function globally
  window.resetFilters = () => {
    categoryFilter.value = 'All';
    searchInput.value = '';
    sortFilter.value = 'featured';
    fetchProjects();
  };
});