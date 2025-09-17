import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { getContentTranslations } from '../modules/contentTranslations.js';

async function editLegalNoticeForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';

  generateTranslationInputs(token);

  await loadLegalNoticeData(id);

  async function loadLegalNoticeData(id) {
    try {
      const response = await fetch(`${backendAPI}legal-notice/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const languagesResponse = await fetch(`/api/all-languages`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const languagesData = await languagesResponse.json();
      const languages = languagesData.languages;

      if (!response.ok) {
        throw new Error('Error al cargar los datos del aviso legal');
      }

      const data = await response.json();

      if (data.success) {
        document.getElementById('title').value =
          data.legalNotice.title || '';
          CKEDITOR.instances.text.setData(data.legalNotice.text || '');
          getContentTranslations(languages, id);
      } else {
        throw new Error(data.message || 'Error al cargar el aviso legal');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert(
        'Error al cargar los datos del aviso legal: ' + error.message,
        'danger'
      );
    }
  }

  // Manejar el envío del formulario
  document
    .getElementById('legal-notice-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validar formulario
      if (!this.checkValidity()) {
        this.classList.add('was-validated');
        return;
      }

      document.getElementById('loading').classList.remove('d-none');
      document.getElementById('success-message').classList.add('d-none');

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
        formData.append('title', document.getElementById('title').value);

        // Obtener datos de CKEditor si está disponible
        const ckeditorContent = CKEDITOR.instances.text
          ? CKEDITOR.instances.text.getData()
          : '';
        formData.append('text', ckeditorContent);

        languages.forEach((language) => {
          if (language.code !== 'es') {
            const titleValue = document.getElementById(
              `${language.code}-title`
            )?.value;
            if (titleValue) {
              formData.append(
                `translations[${language.code}][title]`,
                titleValue
              );
            }

            const textInstance = CKEDITOR.instances[`${language.code}-text`];
            if (textInstance) {
              formData.append(
                `translations[${language.code}][text]`,
                textInstance.getData()
              );
            }
          }
        });

        const response = await fetch(`${backendAPI}edit-legal-notice/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          // Mostrar errores de validación del servidor
          if (data.errors) {
            for (const field in data.errors) {
              const errorElement = document.getElementById(`${field}-error`);
              if (errorElement) {
                errorElement.textContent = data.errors[field][0];
                errorElement.style.display = 'block';
              }
            }
          } else {
            throw new Error(data.message || 'Error al editar el aviso legal');
          }
          return;
        }

        // Mostrar mensaje de éxito
        document.getElementById('success-message').classList.remove('d-none');
        setTimeout(() => {
          document.getElementById('success-message').classList.add('d-none');
        }, 5000);
      } catch (error) {
        console.error('Error submitting form:', error);
        showAlert('Error al editar el aviso legal: ' + error.message, 'danger');
      } finally {
        document.getElementById('loading').classList.add('d-none');
      }
    });

  // Función auxiliar para mostrar alertas
  function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
    document.getElementById('legal-notice').prepend(alertDiv);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alertDiv);
      bsAlert.close();
    }, 5000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  editLegalNoticeForm();
});
