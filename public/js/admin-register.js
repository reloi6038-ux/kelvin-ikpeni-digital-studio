// public/js/admin-register.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const errorMsg = document.getElementById('error-msg');
    const submitBtn = document.getElementById('submit-btn');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    errorMsg.style.display = 'none';
    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        window.location.href = '/admin/dashboard.html';
      } else {
        errorMsg.textContent = data.message || (data.errors ? data.errors.map(err => err.msg).join(', ') : 'Registration failed');
        errorMsg.style.display = 'block';
        submitBtn.textContent = 'Register';
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = 'Network error. Check if the server is running.';
      errorMsg.style.display = 'block';
      submitBtn.textContent = 'Register';
      submitBtn.disabled = false;
    }
  });
});