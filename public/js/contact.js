// public/js/contact.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const statusDiv = document.getElementById('form-status');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop normal HTML form submission

    // 1. Get form data
    const formData = {
      name: form.name.value,
      email: form.email.value,
      subject: form.subject.value,
      message: form.message.value,
    };

    // 2. Update UI for loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusDiv.style.display = 'none';

    try {
      // 3. Send POST request to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        // Handle validation errors from the server
        throw new Error(data.errors ? data.errors.join(', ') : data.message);
      }

      // 4. Show success message
      statusDiv.style.display = 'block';
      statusDiv.style.background = 'rgba(34, 197, 94, 0.1)';
      statusDiv.style.color = '#4ade80';
      statusDiv.style.border = '1px solid rgba(34, 197, 94, 0.2)';
      statusDiv.textContent = data.message;

      // 5. Reset form
      form.reset();

    } catch (error) {
      // 6. Show error message
      statusDiv.style.display = 'block';
      statusDiv.style.background = 'rgba(239, 68, 68, 0.1)';
      statusDiv.style.color = '#f87171';
      statusDiv.style.border = '1px solid rgba(239, 68, 68, 0.2)';
      statusDiv.textContent = error.message || 'Something went wrong. Please try again.';
    } finally {
      // 7. Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
});