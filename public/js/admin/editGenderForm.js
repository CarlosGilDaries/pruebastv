import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { getContentTranslations } from '../modules/contentTranslations.js';

async function editGenderForm() {
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const id = localStorage.getItem('id');
  
  generateTranslationInputs(token);

  await loadGenderData(id);

  // Función para cargar datos del género
  async function loadGenderData(id) {
    try {
      const response = await fetch(`${backendAPI}gender/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const languagesResponse = await fetch(`/api/all-languages`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos del género');
      }

      const data = await response.json();
      const languagesData = await languagesResponse.json();
      const languages = languagesData.languages;

      if (data.success && data.gender) {
        document.getElementById('name').value = data.gender.name || '';
        getContentTranslations(languages, id);
      } else {
        throw new Error(data.message || 'Error al cargar el género');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert(
        'Error al cargar los datos del género: ' + error.message,
        'danger'
      );
    }
  }

  // Manejar el envío del formulario
  document
    .getElementById('form')
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
        formData.append('name', document.getElementById('name').value);
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

        const coverInput = document.getElementById('cover');
        if (coverInput.files.length > 0) {
          formData.append('cover', coverInput.files[0]);
        }

        const response = await fetch(`${backendAPI}edit-gender/${id}`, {
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
            throw new Error(data.message || 'Error al editar el género');
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
        showAlert('Error al editar el género: ' + error.message, 'danger');
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
    document.getElementById('edit-gender').prepend(alertDiv);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alertDiv);
      bsAlert.close();
    }, 5000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  editGenderForm();
});
