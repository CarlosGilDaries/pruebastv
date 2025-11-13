import { setGoogleAnalyticsScript } from "./modules/setScripts.js";

setGoogleAnalyticsScript();

document.getElementById('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('restore_password_email').value;
  const loading = document.getElementById('loading');
  const errorDiv = document.getElementById('form-error');
  const successDiv = document.getElementById('success-message');

  // Reset estados
  errorDiv.classList.add('d-none');
  successDiv.classList.add('d-none');
  loading.classList.remove('d-none');

  try {
    const response = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      successDiv.classList.remove('d-none');
    } else {
      errorDiv.classList.remove('d-none');
      errorDiv.textContent = data.message;
    }
  } catch (error) {
    errorDiv.classList.remove('d-none');
    errorDiv.textContent = 'Error de conexión';
  } finally {
    loading.classList.add('d-none');
  }
});
