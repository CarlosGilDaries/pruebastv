import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { getContentTranslations } from '../modules/contentTranslations.js';

async function editPaymentPoliticForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';

  generateTranslationInputs(token);

  // Cargar datos iniciales
  await loadPaymentPoliticData(id);

  async function loadPaymentPoliticData(id) {
    try {
      const response = await fetch(`${backendAPI}payment-politic/${id}`, {
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

      const data = await response.json();

      if (data.success) {
        document.getElementById('title').value = data.paymentPolitic.title;
        CKEDITOR.instances.text.setData(data.paymentPolitic.text);
        getContentTranslations(languages, id);
      } else {
        console.error('Error:', data.message);
        showError('Error al cargar los datos');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error de conexión al cargar los datos');
    }
  }

  // Mostrar mensaje de error
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    document.getElementById('politic-form').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  // Validación del formulario
  document
    .getElementById('politic-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
      }

      submitForm();
    });

  // Envío del formulario
  async function submitForm() {
    const loadingElement = document.getElementById('loading');
    const successMessage = document.getElementById('success-message');
    const form = document.getElementById('politic-form');

    loadingElement.classList.remove('d-none');
    form.classList.add('was-validated');

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
      formData.append('text', CKEDITOR.instances.text.getData());

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

          const textInstance =
            CKEDITOR.instances[`${language.code}-text`];
          if (textInstance) {
            formData.append(
              `translations[${language.code}][text]`,
              textInstance.getData()
            );
          }
        }
      });

      const response = await fetch(`${backendAPI}edit-payment-politic/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        successMessage.classList.remove('d-none');
        setTimeout(() => {
          successMessage.classList.add('d-none');
        }, 5000);
      } else {
        showError(data.message || 'Error al editar la política');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showError('Error de conexión al enviar el formulario');
    } finally {
      loadingElement.classList.add('d-none');
    }
  }
}

editPaymentPoliticForm();

