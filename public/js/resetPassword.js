import { showPassword } from './modules/showPasword.js';
import { validateUserForm } from './modules/validateUserForm.js';

document.getElementById('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Validar antes de enviar
  const validatedForm = await validateUserForm();
  if (!validatedForm) {
    document.getElementById('loading').classList.add('d-none');;
    return;
  }

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
        window.location.href = '/login';
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

const passwordIcon3 = document.getElementById('toggle-password-3');
const ionEyeIcon3 = document.getElementById('eye-icon-3');
const newPasswordInput = document.getElementById('new-password');
const passwordIcon4 = document.getElementById('toggle-password-4');
const ionEyeIcon4 = document.getElementById('eye-icon-4');
const confirmationNewPasswordInput = document.getElementById(
  'new-password-confirmation'
);

if (passwordIcon3) {
  passwordIcon3.addEventListener('click', (event) => {
    showPassword(event, newPasswordInput, ionEyeIcon3);
  });
}
if (passwordIcon4) {
  passwordIcon4.addEventListener('click', (event) => {
    showPassword(event, confirmationNewPasswordInput, ionEyeIcon4);
  });
}
