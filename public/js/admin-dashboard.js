// public/js/admin-dashboard.js
let projectsCache = [];
let messagesCache = [];

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadProjects();
  loadMessages();
  
  // Tabs Logic
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      document.getElementById(e.target.dataset.target).classList.add('active');
    });
  });

  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('new-project-btn').addEventListener('click', () => openModal());
  document.getElementById('close-modal-btn').addEventListener('click', closeModal);
  document.getElementById('cancel-modal-btn').addEventListener('click', closeModal);
  document.getElementById('project-form').addEventListener('submit', handleFormSubmit);

  // Slug generator
  document.getElementById('p-name').addEventListener('input', (e) => {
    if (document.getElementById('project-id').value === '') {
      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      document.getElementById('p-slug').value = slug;
    }
  });
});

async function checkAuth() {
  const res = await fetch('/api/admin/check');
  if (!res.ok) window.location.href = '/admin/login.html';
}

async function loadProjects() {
  try {
    const res = await fetch('/api/projects?limit=100&admin=true'); 
    const data = await res.json();
    projectsCache = data.data; 
    
    let totalViews = 0;
    projectsCache.forEach(p => totalViews += (p.views || 0));

    document.getElementById('total-views').textContent = totalViews;
    document.getElementById('total-projects').textContent = projectsCache.length;

    const tbody = document.getElementById('projects-table-body');
    if (!projectsCache.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No projects found.</td></tr>';
      return;
    }

    tbody.innerHTML = projectsCache.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td><span class="badge bg-blue">${p.views || 0} views</span></td>
        <td><span class="badge bg-gray">${p.status}</span></td>
        <td>${p.published ? '<span class="badge bg-green">Yes</span>' : '<span class="badge bg-gray">Draft</span>'}</td>
        <td style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <a href="/project-details?slug=${p.slug}&preview=true" target="_blank" class="btn btn-secondary btn-sm" style="color: #a78bfa;">Preview</a>
          <button data-id="${p._id}" class="edit-btn btn btn-secondary btn-sm" style="color: var(--accent-cyan);">Edit</button>
          <button data-id="${p._id}" class="delete-btn btn btn-secondary btn-sm" style="color: #f87171;">Delete</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => editProject(e.target.getAttribute('data-id'))));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => deleteProject(e.target.getAttribute('data-id'))));
  } catch (err) { console.error(err); }
}

async function loadMessages() {
  try {
    const res = await fetch('/api/admin/messages');
    const data = await res.json();
    messagesCache = data.data;

    const unreadCount = messagesCache.filter(m => m.status === 'new').length;
    const badge = document.getElementById('inbox-badge');
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }

    const list = document.getElementById('inbox-list');
    if (!messagesCache.length) {
      list.innerHTML = '<p style="color: var(--text-secondary);">No messages yet.</p>';
      return;
    }

    list.innerHTML = messagesCache.map(m => `
      <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 12px; border: 1px solid ${m.status === 'new' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'};">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap;">
          <strong style="color: var(--text-primary);">${m.name} &lt;${m.email}&gt;</strong>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(m.createdAt).toLocaleDateString()}</span>
        </div>
        <p style="color: var(--accent-cyan); font-weight: 600; margin-bottom: 0.5rem;">${m.subject}</p>
        <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">${m.message}</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <a href="mailto:${m.email}?subject=Re: ${m.subject}" onclick="markMsg('${m._id}', 'replied')" class="btn btn-primary btn-sm">Reply via Email</a>
          ${m.status === 'new' ? `<button onclick="markMsg('${m._id}', 'read')" class="btn btn-secondary btn-sm">Mark as Read</button>` : ''}
          <button onclick="deleteMsg('${m._id}')" class="btn btn-secondary btn-sm" style="color: #f87171;">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) { console.error(err); }
}

async function markMsg(id, status) {
  await fetch('/api/admin/messages/' + id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  loadMessages();
}

async function deleteMsg(id) {
  if (!confirm('Delete this message?')) return;
  await fetch('/api/admin/messages/' + id, { method: 'DELETE' });
  loadMessages();
}

// Modal Logic
const modal = document.getElementById('project-modal');

function openModal(project = null) {
  document.getElementById('project-form').reset();
  document.getElementById('project-id').value = '';
  
  if (project) {
    document.getElementById('modal-title').textContent = 'Edit Project';
    document.getElementById('project-id').value = project._id;
    document.getElementById('p-name').value = project.name;
    document.getElementById('p-slug').value = project.slug;
    document.getElementById('p-category').value = project.category;
    document.getElementById('p-short').value = project.shortDescription;
    document.getElementById('p-long').value = project.longDescription;
    document.getElementById('p-image').value = project.thumbnailUrl || '';
    document.getElementById('p-tech').value = project.technologies.join(', ');
    document.getElementById('p-live').value = project.liveUrl || '';
    document.getElementById('p-repo').value = project.repoUrl || '';
    document.getElementById('p-status').value = project.status;
    document.getElementById('p-featured').checked = project.featured;
    document.getElementById('p-published').checked = project.published;
  } else {
    document.getElementById('modal-title').textContent = 'New Project';
    document.getElementById('p-published').checked = true;
  }
  
  modal.classList.add('active');
}

function closeModal() { modal.classList.remove('active'); }
function editProject(id) { const p = projectsCache.find(x => x._id === id); if (p) openModal(p); }

async function handleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('project-id').value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/projects/${id}` : '/api/projects';

  const payload = {
    name: document.getElementById('p-name').value,
    slug: document.getElementById('p-slug').value,
    category: document.getElementById('p-category').value,
    shortDescription: document.getElementById('p-short').value,
    longDescription: document.getElementById('p-long').value,
    thumbnailUrl: document.getElementById('p-image').value,
    technologies: document.getElementById('p-tech').value.split(',').map(t => t.trim()).filter(Boolean),
    liveUrl: document.getElementById('p-live').value,
    repoUrl: document.getElementById('p-repo').value,
    status: document.getElementById('p-status').value,
    featured: document.getElementById('p-featured').checked,
    published: document.getElementById('p-published').checked
  };

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  if (data.success) {
    closeModal();
    loadProjects();
  } else {
    alert(data.message || 'Error');
  }
}

async function deleteProject(id) {
  if (!confirm('Delete this project permanently?')) return;
  const res = await fetch('/api/projects/' + id, { method: 'DELETE' });
  if (res.ok) loadProjects();
}

async function logout() {
  await fetch('/api/admin/logout', { method: 'POST' });
  window.location.href = '/admin/login.html';
}