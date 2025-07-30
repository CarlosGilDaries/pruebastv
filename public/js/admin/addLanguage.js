import { renderCategoriesAndGenders } from './renderCategoriesGendersForm.js';

document.addEventListener('DOMContentLoaded', async function () {
  async function initAddLanguage() {
    const backendAPI = '/api/';
    const authToken = localStorage.getItem('auth_token');

    try {
      // Primero cargamos los datos para generar los campos
      const [
        categoriesResponse,
        gendersResponse,
        tagsResponse,
        actionsResponse,
        contentResponse,
      ] = await Promise.all([
        fetch('/api/dropdown-categories-menu'),
        fetch('/api/genders'),
        fetch('/api/tags'),
        fetch('/api/actions'),
        fetch('/api/content'),
      ]);

      const [categoriesData, gendersData, tagsData, actionsData, contentData] =
        await Promise.all([
          categoriesResponse.json(),
          gendersResponse.json(),
          tagsResponse.json(),
          actionsResponse.json(),
          contentResponse.json(),
        ]);

      // Creamos un objeto data similar al que recibiríamos al editar, pero con valores vacíos
      const mockData = {
        success: true,
        language: {
          translations: [], // No hay traducciones para un nuevo idioma
          is_active: 1,
        },
        categories: categoriesData.categories,
        genders: gendersData.genders,
        tags: tagsData.tags,
        actions: actionsData.actions,
        contents: contentData.data.movies,
      };

      // Renderizamos los campos (sin callback ya que no necesitamos hacer nada después)
      await renderCategoriesAndGenders(mockData, () => {});

      // Manejar envío del formulario
      document
        .getElementById('add-language-form')
        .addEventListener('submit', async function (e) {
          e.preventDefault();

          // Validar formulario
          if (!this.checkValidity()) {
            e.stopPropagation();
            this.classList.add('was-validated');
            return;
          }

          // Resetear mensajes de error
          document
            .querySelectorAll('#add-language-form .invalid-feedback')
            .forEach((el) => {
              el.textContent = '';
              el.style.display = 'none';
            });
          document
            .getElementById('add-language-success-message')
            .classList.add('d-none');

          // Mostrar loader
          document
            .getElementById('add-language-loading')
            .classList.remove('d-none');

          // Verificar autenticación
          if (!authToken) {
            window.location.href = '/login';
            return;
          }

          try {
            // Recoger todos los datos del formulario
            const formData = {
              name: document.getElementById('add-language-name').value,
              code: document.getElementById('add-language-code').value,
              is_active: document.getElementById('is_active').checked ? 1 : 0,
              translations: {},
            };

            // Agregar traducciones básicas
            const basicTranslations = [
              'login',
              'forgot_password',
              'login_button',
              'no_account',
              'register',
              'legal_notice',
              'privacy_policy',
              'contact',
              'watch_now',
              'keep_watching',
            ];

            basicTranslations.forEach((key) => {
              const element = document.getElementById(`translation_${key}`);
              if (element) {
                formData.translations[key] = element.value;
              }
            });

            // Agregar traducciones de géneros, categorías, etc.
            const translationInputs = document.querySelectorAll(
              '[name^="translations["]'
            );
            translationInputs.forEach((input) => {
              const key = input.name.match(/\[(.*?)\]/)[1];
              // Solo agregar si no es un campo básico ya incluido
              if (!basicTranslations.includes(key)) {
                formData.translations[key] = input.value;
              }
            });

            // Agregar contenido de CKEditor
            for (let instanceName in CKEDITOR.instances) {
              if (CKEDITOR.instances.hasOwnProperty(instanceName)) {
                const editor = CKEDITOR.instances[instanceName];
                const textarea = document.getElementById(instanceName);
                if (textarea && textarea.name.startsWith('translations[')) {
                  const key = textarea.name.match(/\[(.*?)\]/)[1];
                  formData.translations[key] = editor.getData();
                }
              }
            }

            const response = await fetch(backendAPI + 'add-language', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
              // Mostrar errores del servidor si existen
              if (data.errors) {
                Object.entries(data.errors).forEach(([field, messages]) => {
                  const errorElement = document.getElementById(
                    `${field}-error`
                  );
                  if (errorElement) {
                    errorElement.textContent = messages.join(', ');
                    errorElement.style.display = 'block';
                  }
                });
              } else {
                throw new Error(data.error || 'Error al crear el idioma');
              }
              return;
            }

            // Mostrar mensaje de éxito
            const successMessage = document.getElementById(
              'add-language-success-message'
            );
            successMessage.classList.remove('d-none');

            setTimeout(() => {
              successMessage.classList.add('d-none');
            }, 5000);

            // Resetear formulario
            this.reset();
            this.classList.remove('was-validated');
          } catch (error) {
            console.error('Error:', error);
            alert('Error al crear el idioma: ' + error.message);
          } finally {
            document
              .getElementById('add-language-loading')
              .classList.add('d-none');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
    } catch (error) {
      console.error('Error inicializando formulario:', error);
      alert('Error al cargar los datos iniciales: ' + error.message);
    }
  }

  initAddLanguage();
});
