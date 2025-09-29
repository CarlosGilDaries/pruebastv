import { renderCategoriesAndGenders } from './renderCategoriesGendersForm.js';

async function editLanguageForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';

  await loadLanguageData(id);

  async function loadLanguageData(id) {
    try {
      // Cargar datos de la Idioma
      const response = await fetch(`${backendAPI}language/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos de la Idioma');
      }

      const data = await response.json();

      if (data.success && data.language) {
        // Primero renderizar el formulario
        await new Promise((resolve) => {
          renderCategoriesAndGenders(data, resolve);
        });

        // Rellenar datos del idioma
        document.getElementById('edit-language-name').value =
          data.language.name || '';
        document.getElementById('edit-language-code').value =
          data.language.code || '';
        document.getElementById('is_active').checked =
          data.language.is_active === 1;

        // Rellenar traducciones (ahora los editores están listos)
        if (
          data.language.translations &&
          data.language.translations.length > 0
        ) {
          data.language.translations.forEach((translation) => {
            const inputElement = document.getElementById(
              `translation_${translation.key}`
            );
            if (inputElement) {
              inputElement.value = translation.value || '';

              // Actualizar también los editores CKEDITOR si existen
              if (CKEDITOR.instances[inputElement.id]) {
                CKEDITOR.instances[inputElement.id].setData(
                  translation.value || ''
                );
              }
            }
          });
        }
      } else {
        throw new Error(data.message || 'Error al cargar la Idioma');
      }
    } catch (error) {
      console.error('Error:', error);
      // Mostrar error al usuario
      const errorElement = document.createElement('div');
      errorElement.className = 'alert alert-danger mt-3';
      errorElement.textContent = error.message;
      document.getElementById('edit-language-form').prepend(errorElement);
      setTimeout(() => errorElement.remove(), 5000);
    }
  }

  // Manejar el envío del formulario
  document
    .getElementById('edit-language-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validar formulario
      if (!this.checkValidity()) {
        this.classList.add('was-validated');
        return;
      }

      const id = localStorage.getItem('id');
      document
        .getElementById('edit-language-loading')
        .classList.remove('d-none');
      document
        .getElementById('edit-language-success-message')
        .classList.add('d-none');

      try {
        const formData = new FormData();
        formData.append(
          'name',
          document.getElementById('edit-language-name').value
        );
        formData.append(
          'code',
          document.getElementById('edit-language-code').value
        );
        formData.append(
          'is_active',
          document.getElementById('is_active').checked ? '1' : '0'
        );

        // Agregar traducciones al formData
        const translationInputs = document.querySelectorAll(
          '[name^="translations["]'
        );
        translationInputs.forEach((input) => {
          const key = input.name.match(/\[(.*?)\]/)[1];
          formData.append(`translations[${key}]`, input.value);
        });

        for (let instanceName in CKEDITOR.instances) {
          if (CKEDITOR.instances.hasOwnProperty(instanceName)) {
            const editor = CKEDITOR.instances[instanceName];
            const textarea = document.getElementById(instanceName);
            if (textarea && textarea.name.startsWith('translations[')) {
              const key = textarea.name.match(/\[(.*?)\]/)[1];
              const data = editor.getData();
              formData.append(`translations[${key}]`, data);
            }
          }
        }

        const response = await fetch(`${backendAPI}edit-language/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          // Mostrar errores de validación del servidor
          if (data.errors) {
            for (const field in data.errors) {
              const errorElement = document.getElementById(
                `edit-language-${field}-error`
              );
              if (errorElement) {
                errorElement.textContent = data.errors[field][0];
                errorElement.style.display = 'block';
              }
            }
          } else {
            throw new Error(data.message || 'Error al editar la Idioma');
          }
          return;
        }

        // Mostrar mensaje de éxito
        document
          .getElementById('edit-language-success-message')
          .classList.remove('d-none');
        setTimeout(() => {
          document
            .getElementById('edit-language-success-message')
            .classList.add('d-none');
        }, 5000);
      } catch (error) {
        console.error('Error submitting form:', error);
        // Mostrar error al usuario
        const errorElement = document.createElement('div');
        errorElement.className = 'alert alert-danger mt-3';
        errorElement.textContent = error.message;
        this.prepend(errorElement);
        setTimeout(() => errorElement.remove(), 5000);
      } finally {
        document
          .getElementById('edit-language-loading')
          .classList.add('d-none');
      }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  editLanguageForm();
});