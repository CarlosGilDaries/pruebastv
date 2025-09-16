import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { getContentTranslations } from '../modules/contentTranslations.js';

document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const id = localStorage.getItem('id');
  const form = document.getElementById('form');

  if (!id) {
    showError('No se proporcionó ID de etiqueta');
    return;
  }

  generateTranslationInputs(token);

  // Cargar datos de la etiqueta
  loadTagData(id);

  // Manejar el envío del formulario
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    await submitTagForm(id);
  });

  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    form.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  async function loadTagData(id) {
    try {
      const response = await fetch(`${backendAPI}tag/${id}`, {
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
        throw new Error('Error al cargar los datos');
      }

      const data = await response.json();
      const languagesData = await languagesResponse.json();
      const languages = languagesData.languages;

      if (data.success && data.tag) {
        document.getElementById('name').value = data.tag.name;
        getContentTranslations(languages, id);
      } else {
        throw new Error(data.message || 'Error al cargar la etiqueta');
      }
    } catch (error) {
      console.error('Error:', error);
      showError(error.message);
    }
  }

  async function submitTagForm(id) {
    const loading = document.getElementById('loading');
    const successMessage = document.getElementById('success-message');
    const name = document.getElementById('name').value;

    loading.classList.remove('d-none');
    successMessage.classList.add('d-none');

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
      formData.append('name', name);
      languages.forEach((language) => {
        if (language.code !== 'es') {
          const nameValue = document.getElementById(
            `${language.code}-name`
          )?.value;
          if (nameValue) {
            formData.append(`translations[${language.code}][name]`, nameValue);
          }
        }
      });

      const response = await fetch(`${backendAPI}edit-tag/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();

      if (data.success) {
        successMessage.classList.remove('d-none');
        setTimeout(() => {
          successMessage.classList.add('d-none');
        }, 5000);
      } else {
        throw new Error(data.message || 'Error al editar la etiqueta');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showError(error.message);
    } finally {
      loading.classList.add('d-none');
    }
  }
});
