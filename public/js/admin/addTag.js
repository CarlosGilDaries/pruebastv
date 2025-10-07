import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { validateAddForm } from '../modules/validateAddForm.js';

async function initAddTag() {
  const backendAPI = '/api/';

  // Obtener token de autenticación
  const authToken = localStorage.getItem('auth_token');
  if (!authToken) {
    window.location.href = '/login';
    return;
  }

  generateTranslationInputs(authToken);

  const languagesResponse = await fetch(`/api/all-languages`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  const languagesData = await languagesResponse.json();
  const languages = languagesData.languages;

  // Manejar envío del formulario
  document
    .getElementById('form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validación del formulario
      if (!this.checkValidity()) {
        this.classList.add('was-validated');
        return;
      }

      if (!(await validateAddForm())) {
        return;
      }

      // Resetear mensajes de error
      document
        .querySelectorAll('#form .invalid-feedback')
        .forEach((el) => (el.textContent = ''));
      document.getElementById('success-message').classList.add('d-none');

      // Mostrar loader
      document.getElementById('loading').classList.remove('d-none');

      // Crear FormData
      const formAdData = new FormData();
      formAdData.append('name', document.getElementById('name').value);
      languages.forEach((language) => {
        if (language.code !== 'es') {
          const nameValue = document.getElementById(
            `${language.code}-name`
          )?.value;
          if (nameValue) {
            formAdData.append(`translations[${language.code}][name]`, nameValue);
          }
        }
      });
      if (document.getElementById('cover')) {
        formAdData.append('cover', document.getElementById('cover').files[0]);
      }

      try {
        const response = await fetch(backendAPI + 'add-tag', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formAdData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al añadir la etiqueta');
        }

        // Mostrar mensaje de éxito
        document.getElementById('success-message').classList.remove('d-none');
        setTimeout(() => {
          document.getElementById('success-message').classList.add('d-none');
        }, 5000);

        // Resetear formulario
        this.reset();
        this.classList.remove('was-validated');
      } catch (error) {
        console.error('Error:', error);
        // Mostrar error al usuario
        const errorElement = document.getElementById('name-error');
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
      } finally {
        document.getElementById('loading').classList.add('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  initAddTag();
});
