import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';

async function initAddAction() {
  const backendAPI = '/api/';
  const authToken = localStorage.getItem('auth_token');
  const select = document.getElementById('order');

  generateTranslationInputs(authToken);

  try {
    const response = await fetch(backendAPI + 'actions', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const languagesResponse = await fetch(`/api/all-languages`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const languagesData = await languagesResponse.json();
    const languages = languagesData.languages;

    const data = await response.json();
    const positions = data.positions;

    // Llenar opciones de orden
    if (positions != null && positions.length > 0) {
      positions.forEach((position) => {
        const option = document.createElement('option');
        option.textContent = position;
        option.value = position;
        select.appendChild(option);
      });

      // Agregar última opción (n+1)
      const lastOption = document.createElement('option');
      lastOption.textContent = positions.length + 1;
      lastOption.value = positions.length + 1;
      select.appendChild(lastOption);
    } else {
      // Si no hay posiciones, agregar solo la opción 1
      const option = document.createElement('option');
      option.textContent = 1;
      option.value = 1;
      select.appendChild(option);
    }

    // Manejar envío del formulario
    document
      .getElementById('add-action-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        // Resetear mensajes de error
        document
          .querySelectorAll('#add-action-form .invalid-feedback')
          .forEach((el) => {
            el.textContent = '';
            el.style.display = 'none';
          });
        document.getElementById('success-message').classList.add('d-none');

        // Validar formulario
        if (!this.checkValidity()) {
          e.stopPropagation();
          this.classList.add('was-validated');
          return;
        }

        // Mostrar loader
        document.getElementById('loading').classList.remove('d-none');

        // Verificar autenticación
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        // Crear FormData
        const formData = new FormData();

        languages.forEach((language) => {
          if (language.code !== 'es') {
            const textValue = document.getElementById(
              `${language.code}-text`
            )?.value;
            if (textValue) {
              formData.append(
                `translations[${language.code}][text]`,
                textValue
              );
            }

            const subTextValue = document.getElementById(
              `${language.code}-subtext`
            )?.value;
            if (subTextValue) {
              formData.append(
                `translations[${language.code}][subtext]`,
                subTextValue
              );
            }

            const buttonValue = document.getElementById(
              `${language.code}-button`
            )?.value;
            if (buttonValue) {
              formData.append(
                `translations[${language.code}][button]`,
                buttonValue
              );
            }
          }
        });
        formData.append('name', document.getElementById('name').value);
        formData.append('order', document.getElementById('order').value);
        formData.append('text', document.getElementById('text').value);
        formData.append('subtext', document.getElementById('subtext').value);
        formData.append(
          'button_text',
          document.getElementById('button_text').value
        );
        formData.append('url', document.getElementById('url').value);

        const pictureInput = document.getElementById('picture');
        if (pictureInput.files.length > 0) {
          formData.append('picture', pictureInput.files[0]);
        }

        try {
          const response = await fetch(backendAPI + 'add-action', {
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
              throw new Error(data.error || 'Error al subir la acción');
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
          alert('Error al añadir la acción: ' + error.message);
        } finally {
          document.getElementById('loading').classList.add('d-none');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  } catch (error) {
    console.error('Error inicializando formulario:', error);
  }
}

// Inicializar el formulario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initAddAction);
