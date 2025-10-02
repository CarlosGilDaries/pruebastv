import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { validateAddForm } from '../modules/validateAddForm.js';

document.addEventListener('DOMContentLoaded', function () {
  async function initAddGender() {
    const backendAPI = '/api/';
    const authToken = localStorage.getItem('auth_token');

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

        // Validar formulario
        if (!this.checkValidity()) {
          e.stopPropagation();
          this.classList.add('was-validated');
          return;
        }
        if (!validateAddForm()) {
          return;
        }

        // Resetear mensajes de error
        document.querySelectorAll('#form .invalid-feedback').forEach((el) => {
          el.textContent = '';
          el.style.display = 'none';
        });
        document.getElementById('success-message').classList.add('d-none');

        // Mostrar loader
        document.getElementById('loading').classList.remove('d-none');

        // Verificar autenticación
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        try {
          const formData = new FormData();
          formData.append('name', document.getElementById('name').value);
          if (document.getElementById('cover')) {
            formData.append('cover', document.getElementById('cover').files[0]);
          }

          languages.forEach((language) => {
            if (language.code !== 'es') {
              const nameValue = document.getElementById(
                `${language.code}-name`
              )?.value;
              if (nameValue) {
                formData.append(
                  `translations[${language.code}][name]`,
                  nameValue
                );
              }
            }
          });

          const response = await fetch(backendAPI + 'add-gender', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            // Mostrar errores del servidor si existen
            if (data.errors) {
              Object.entries(data.errors).forEach(([field, messages]) => {
                const errorElement = document.getElementById(`${field}-error`);
                if (errorElement) {
                  errorElement.textContent = messages.join(', ');
                  errorElement.style.display = 'block';
                }
              });
            } else {
              throw new Error(data.error || 'Error al añadir el género');
            }
            return;
          }

          // Mostrar mensaje de éxito
          const successMessage = document.getElementById('success-message');
          successMessage.classList.remove('d-none');

          setTimeout(() => {
            successMessage.classList.add('d-none');
          }, 5000);

          // Resetear formulario
          this.reset();
          this.classList.remove('was-validated');
        } catch (error) {
          console.error('Error:', error);
          alert('Error al añadir el género: ' + error.message);
        } finally {
          document.getElementById('loading').classList.add('d-none');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

  initAddGender();
});
