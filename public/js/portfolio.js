// public/js/portfolio.js
document.addEventListener('DOMContentLoaded', () => {
  const categoryFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');
  const grid = document.getElementById('portfolio-grid');

  if (!grid) return;

  // Initial load
  fetchProjects();
  loadCategories();

  // Event Listeners for filters
  categoryFilter.addEventListener('change', () => fetchProjects());
  
  // Debounce search input to avoid firing on every keystroke
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => fetchProjects(), 500);
  });

  // Fetch categories to populate the dropdown
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
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }

  // Fetch projects based on filters
  async function fetchProjects() {
    const category = categoryFilter.value;
    const search = searchInput.value;
    
    grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1;">Loading projects...</p>';

    try {
      const url = new URL('/api/projects', window.location.origin);
      if (category && category !== 'All') url.searchParams.append('category', category);
      if (search) url.searchParams.append('search', search);

      const response = await fetch(url);
      const data = await response.json();

      grid.innerHTML = ''; // Clear loading

      if (data.data.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1;">No projects found matching your criteria.</p>';
        return;
      }

      data.data.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = 'project-card reveal';
        card.style.transitionDelay = `${index * 0.1}s`;
        
        const techBadges = project.technologies.slice(0, 3).map(tech => 
          `<span class="tech-badge">${tech}</span>`
        ).join('');

        const imageUrl = project.thumbnailUrl || 'https://via.placeholder.com/600x400/1A1F2E/22D3EE?text=' + encodeURIComponent(project.name);

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
        grid.appendChild(card);
      });

      // Re-trigger the reveal observer for the newly added cards
      if (typeof initRevealOnScroll === 'function') {
        initRevealOnScroll();
      }

    } catch (error) {
      console.error('Error:', error);
      grid.innerHTML = '<p style="color: #ef4444; grid-column: 1 / -1;">Error loading projects. Please refresh.</p>';
    }
  }
});