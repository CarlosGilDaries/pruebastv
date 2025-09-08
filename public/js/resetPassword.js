document.getElementById('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const password = document.getElementById('new-password').value;
  const passwordConfirmation = document.getElementById(
    'new-password-confirmation'
  ).value;
  const loading = document.getElementById('loading');
  const errorDiv = document.getElementById('form-error');
  const successDiv = document.getElementById('success-message');

  // Obtener token y email de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const email = urlParams.get('email');

  if (!token || !email) {
    errorDiv.classList.remove('d-none');
    errorDiv.textContent = 'Enlace inválido';
    return;
  }

  // Reset estados
  errorDiv.classList.add('d-none');
  successDiv.classList.add('d-none');
  loading.classList.remove('d-none');

  try {
    const response = await fetch('/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      successDiv.classList.remove('d-none');
      // Redirigir después de éxito
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
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
