// public/js/project-details.js
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  const container = document.getElementById('project-content');

  if (!slug) {
    container.innerHTML = `
      <div class="content-card" style="text-align:center; padding: 4rem 2rem;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">Project Not Found</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">No project slug was provided in the URL.</p>
        <a href="/portfolio" class="btn btn-primary">Return to Portfolio</a>
      </div>
    `;
    return;
  }

  fetchProject(slug);

  async function fetchProject(slug) {
    try {
      const isPreview = window.location.search.includes('preview=true');
      const res = await fetch(`/api/projects/${slug}${isPreview ? '?preview=true' : ''}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.message || 'Project not found');

      const project = data.data;

      // Update document title
      document.title = `${project.name} | Kelvin Ikpeni Digital Studio`;

      // Format date
      const dateStr = project.completionDate 
        ? new Date(project.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : 'Ongoing / Planned';

      // Generate Tech Badges
      const techBadges = project.technologies.map(tech => 
        `<span class="tech-badge" style="margin-bottom: 0.5rem; font-size: 0.8rem; padding: 0.4rem 0.8rem;">${tech}</span>`
      ).join('');

      // Generate Links
      let linksHtml = '';
      if (project.liveUrl && project.liveUrl !== '#') {
        linksHtml += `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="margin-bottom: 0.5rem;">View Live Site</a>`;
      }
      if (project.repoUrl && project.repoUrl !== '#') {
        linksHtml += `<a href="${project.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="margin-bottom: 0.5rem;">View Source Code</a>`;
      }

      // Fallback image
      const fallbackImg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="1200" height="600" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1A1F2E"/>
          <text x="50%" y="50%" fill="#22D3EE" font-family="sans-serif" font-size="40" text-anchor="middle" dominant-baseline="middle">${project.name}</text>
        </svg>
      `)}`;
      
      const imageUrl = project.thumbnailUrl || fallbackImg;

      container.className = 'reveal is-visible';

      container.innerHTML = `
        <div style="margin-bottom: 3rem;">
          <span class="project-category" style="font-size: 1rem; letter-spacing: 2px;">${project.category}</span>
          <h1 style="font-size: clamp(2.5rem, 5vw, 4rem); margin: 1rem 0; line-height: 1.1;">${project.name}</h1>
          <p style="font-size: 1.25rem; color: var(--text-secondary); max-width: 700px; line-height: 1.6;">${project.shortDescription}</p>
        </div>

        <div style="width: 100%; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 3rem; box-shadow: 0 20px 40px rgba(0,0,0,0.4); background: var(--bg-card); border: 1px solid rgba(255,255,255,0.05);">
          <img src="${imageUrl}" alt="${project.name}" style="width: 100%; height: auto; display: block;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 3rem; @media(min-width: 768px) { grid-template-columns: 2fr 1fr; }">
          
          <div>
            <h2 style="margin-bottom: 1.5rem; font-size: 1.8rem; color: var(--text-primary);">About This Project</h2>
            <div style="font-size: 1.1rem; line-height: 1.8; color: var(--text-secondary); white-space: pre-wrap; margin-bottom: 2rem;">
              ${project.longDescription}
            </div>
          </div>

          <aside style="background: var(--bg-card); padding: 2rem; border-radius: var(--radius-lg); height: fit-content; border: 1px solid rgba(255,255,255,0.05);">
            <h3 style="margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; font-size: 1.2rem;">Project Details</h3>
            
            <div style="margin-bottom: 1.5rem;">
              <span style="display: block; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.3rem;">Status</span>
              <strong style="text-transform: capitalize; font-size: 1.1rem;">${project.status.replace('-', ' ')}</strong>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <span style="display: block; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.3rem;">Timeline</span>
              <strong style="font-size: 1.1rem;">${dateStr}</strong>
            </div>

            <div style="margin-bottom: 2rem;">
              <span style="display: block; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.8rem;">Technologies Used</span>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${techBadges || '<span style="color:var(--text-secondary);">None specified</span>'}
              </div>
            </div>

            ${linksHtml ? `
              <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
                ${linksHtml}
              </div>
            ` : `
              <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="color: var(--text-secondary); font-size: 0.9rem; font-style: italic;">No live links available for this project yet.</p>
              </div>
            `}
          </aside>
        </div>
      `;

    } catch (error) {
      console.error(error);
      container.innerHTML = `
        <div class="content-card" style="text-align:center; padding: 4rem 2rem; border-color: rgba(239, 68, 68, 0.3);">
          <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #f87171;">Error Loading Project</h1>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">${error.message}</p>
          <a href="/portfolio" class="btn btn-secondary">Back to Portfolio</a>
        </div>
      `;
    }
  }
});