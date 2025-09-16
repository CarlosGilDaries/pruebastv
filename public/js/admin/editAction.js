import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { getContentTranslations } from '../modules/contentTranslations.js';

async function editActionForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';

  generateTranslationInputs(token);

  await loadActionData(id);

  async function loadActionData(id) {
    try {
      // Cargar datos en paralelo
      const [orderResponse, actionResponse, languagesResponse] =
        await Promise.all([
          fetch(backendAPI + 'actions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendAPI}action/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/all-languages`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

      const [orderData, actionData, languagesData] = await Promise.all([
        orderResponse.json(),
        actionResponse.json(),
        languagesResponse.json(),
      ]);

      if (!actionData.success || !actionData.action) {
        throw new Error(
          actionData.message || 'Error al cargar los datos de la acción'
        );
      }

      const positions = orderData.positions || [];
      const action = actionData.action;
      const languages = languagesData.languages;
      const select = document.getElementById('order');

      // Llenar opciones de orden
      positions.forEach((position) => {
        const option = document.createElement('option');
        option.value = position;
        option.textContent = position;
        select.appendChild(option);
      });

      // Establecer valores del formulario
      document.getElementById('name').value = action.name || '';
      document.getElementById('order').value = action.order || '';
      document.getElementById('text').value = action.text || '';
      document.getElementById('subtext').value = action.subtext || '';
      document.getElementById('button_text').value = action.button_text || '';
      document.getElementById('url').value = action.url || '';
      getContentTranslations(languages, id);

      // Mostrar nombre de la imagen actual si existe
      if (action.picture) {
        const fileName = action.picture.split('/').pop();
        const pictureInput = document.getElementById('picture');
        // Bootstrap 5 no soporta mostrar el nombre del archivo actual directamente
        // Podemos agregar un pequeño texto informativo
        const fileInfo = document.createElement('small');
        fileInfo.className = 'form-text text-muted d-block mt-1';
        fileInfo.textContent = `Imagen actual: ${fileName}`;
        pictureInput.parentNode.insertBefore(
          fileInfo,
          pictureInput.nextSibling
        );
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos: ' + error.message);
    }
  }

  // Manejar envío del formulario
  document
    .getElementById('edit-action-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validar formulario
      if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
      }

      // Resetear mensajes de error
      document.querySelectorAll('.invalid-feedback').forEach((el) => {
        el.textContent = '';
        el.style.display = 'none';
      });
      document.getElementById('success-message').classList.add('d-none');

      // Mostrar loader
      document.getElementById('loading').classList.remove('d-none');

      try {
        const languagesResponse = await fetch(`/api/all-languages`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const languagesData = await languagesResponse.json();
        const languages = languagesData.languages;
        
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('order', document.getElementById('order').value);
        formData.append('text', document.getElementById('text').value);
        formData.append('subtext', document.getElementById('subtext').value);
        formData.append(
          'button_text',
          document.getElementById('button_text').value
        );
        formData.append('url', document.getElementById('url').value);

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

        const pictureInput = document.getElementById('picture');
        if (pictureInput.files.length > 0) {
          formData.append('picture', pictureInput.files[0]);
        }

        const response = await fetch(`${backendAPI}edit-action/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
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
            throw new Error(data.message || 'Error al actualizar la acción');
          }
          return;
        }

        // Mostrar mensaje de éxito
        const successMessage = document.getElementById('success-message');
        successMessage.classList.remove('d-none');

        setTimeout(() => {
          successMessage.classList.add('d-none');
        }, 5000);
      } catch (error) {
        console.error('Error al enviar el formulario:', error);
        alert('Error al guardar los cambios: ' + error.message);
      } finally {
        document.getElementById('loading').classList.add('d-none');
      }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', editActionForm);
