import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { validateAddForm } from '../modules/validateAddForm.js';

document.addEventListener('DOMContentLoaded', function () {
  async function initAddCategory() {
    const backendAPI = '/api/';
    const authToken = localStorage.getItem('auth_token');
    const select = document.getElementById('priority');

    generateTranslationInputs(authToken);

    try {
      const languagesResponse = await fetch(`/api/all-languages`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const languagesData = await languagesResponse.json();
      const languages = languagesData.languages;


      const response = await fetch(backendAPI + 'categories', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      const priorities = data.priorities || [];

      // Llenar opciones de prioridad
      if (priorities.length > 0) {
        priorities.forEach((priority) => {
          const option = document.createElement('option');
          option.textContent = priority;
          option.value = priority;
          select.appendChild(option);
        });

        // Agregar última opción (n+1)
        const lastOption = document.createElement('option');
        lastOption.textContent = priorities.length + 1;
        lastOption.value = priorities.length + 1;
        select.appendChild(lastOption);
      } else {
        // Si no hay prioridades, agregar solo la opción 1
        const option = document.createElement('option');
        option.textContent = 1;
        option.value = 1;
        select.appendChild(option);
      }

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

          if (!(await validateAddForm())) {
            return;
          }

          // Resetear mensajes de error
          document
            .querySelectorAll('#form .invalid-feedback')
            .forEach((el) => {
              el.textContent = '';
              el.style.display = 'none';
            });
          document.querySelectorAll('.success-submit').forEach((element) => {
            element.classList.add('d-none');
          });

          // Mostrar loader
          document
            .getElementById('loading')
            .classList.remove('d-none');

          // Verificar autenticación
          if (!authToken) {
            window.location.href = '/login';
            return;
          }

          try {
            const formData = new FormData();

            formData.append(
              'name',
              document.getElementById('name').value
            );
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
            if (document.getElementById('cover')) {
              formData.append(
                'cover',
                document.getElementById('cover').files[0]
              );
            }
            formData.append(
              'priority',
              document.getElementById('priority').value
            );
            formData.append(
              'render_at_index',
              document.getElementById('render').checked ? '1' : '0'
            );

            const seoFormData = new FormData();
            let seo = false;

            if (document.getElementById('seo-title').value) {
              seoFormData.append(
                'title',
                document.getElementById('seo-title').value
              );
              seo = true;
            }

            if (document.getElementById('seo-keywords').value) {
              seoFormData.append(
                'keywords',
                document.getElementById('seo-keywords').value
              );
              seo = true;
            }

            if (document.getElementById('seo-robots').value) {
              seoFormData.append(
                'robots',
                document.getElementById('seo-robots').value
              );
              seo = true;
            }

            if (document.getElementById('seo-alias').value) {
              seoFormData.append(
                'alias',
                document.getElementById('seo-alias').value
              );
              seo = true;
            }

            if (document.getElementById('seo-url').value) {
              seoFormData.append(
                'seo-url',
                document.getElementById('seo-url').value
              );
              seo = true;
            }

            if (document.getElementById('seo-description').value) {
              seoFormData.append(
                'seo-description',
                document.getElementById('seo-description').value
              );
              seo = true;
            }

            if (seo) {
              seoFormData.append('key', 'category');
            }

            const response = await fetch(backendAPI + 'add-category', {
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
                  const errorElement = document.getElementById(
                    `${field}-error`
                  );
                  if (errorElement) {
                    errorElement.textContent = messages.join(', ');
                    errorElement.style.display = 'block';
                  }
                });
              } else {
                throw new Error(data.error || 'Error al crear la categoría');
              }
              return;
            }

            if (data.success && seo) {
              const seoResponse = await fetch(
                backendAPI + `create-seo-settings/${data.category.id}`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                  body: seoFormData,
                }
              );

              const seoData = await seoResponse.json();
              console.log(seoData);
            }

            // Mostrar mensaje de éxito
            document.querySelectorAll('.success-submit').forEach((element) => {
              element.classList.remove('d-none');
            });

            setTimeout(() => {
              document
                .querySelectorAll('.success-submit')
                .forEach((element) => {
                  element.classList.add('d-none');
                });
            }, 5000);

            // Resetear formulario
            this.reset();
            this.classList.remove('was-validated');
          } catch (error) {
            console.error('Error:', error);
            alert('Error al crear la categoría: ' + error.message);
          } finally {
            document
              .getElementById('loading')
              .classList.add('d-none');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
    } catch (error) {
      console.error('Error inicializando formulario:', error);
      alert('Error al cargar los datos iniciales: ' + error.message);
    }
  }

  initAddCategory();
});
