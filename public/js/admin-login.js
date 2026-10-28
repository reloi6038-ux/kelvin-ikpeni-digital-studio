// public/js/admin-login.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const errorMsg = document.getElementById('error-msg');
    const submitBtn = document.getElementById('submit-btn');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    errorMsg.style.display = 'none';
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        window.location.href = '/admin/dashboard.html';
      } else {
        errorMsg.textContent = data.message;
        errorMsg.style.display = 'block';
        submitBtn.textContent = 'Log In';
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = 'Network error. Check server.';
      errorMsg.style.display = 'block';
      submitBtn.textContent = 'Log In';
      submitBtn.disabled = false;
    }
  });
});