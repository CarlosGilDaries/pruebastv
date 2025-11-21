import { validateAddForm } from '../modules/validateAddForm.js';
import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { buildSeoFormData } from '../modules/buildSeoFormData.js';
import { buildSeoInputs } from '../modules/buildSeoInputs.js';
import { setupSlugGenerator } from '../modules/setUpSlugGeneratos.js';
import {
  buildScriptInputs,
  buildScriptFormData,
} from '../modules/buildScriptsSettings.js';
import { setupPlansGendersCategoriesTags } from '../modules/setUpPlansGendersCategoriesTags.js';

buildSeoInputs();
buildScriptInputs();
setupSlugGenerator();

async function initContent() {
  const backendAPI = '/api/';
  const authToken = localStorage.getItem('auth_token');

  const languagesResponse = await fetch(`/api/all-languages`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  const languagesData = await languagesResponse.json();
  const languages = languagesData.languages;

  CKEDITOR.replace(`tagline`);
  setupPlansGendersCategoriesTags(authToken);
  generateTranslationInputs(authToken);

  // Mostrar nombre de archivos seleccionados
  const setupFileInput = (inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('change', function (e) {
        const fileName =
          e.target.files[0]?.name || 'Ningún archivo seleccionado';
        // Mostrar el nombre del archivo en el input (Bootstrap lo hace automáticamente)
      });
    }
  };

  setupFileInput('cover');
  setupFileInput('tall-cover');
  setupFileInput('trailer');

  // Toggle campos Pay Per View
  document
    .getElementById('pay_per_view')
    .addEventListener('change', function () {
      const payPerViewFields = document.getElementById('pay_per_view_fields');
      if (this.checked) {
        payPerViewFields.classList.remove('d-none');
      } else {
        payPerViewFields.classList.add('d-none');
        document.getElementById('pay_per_view_price').value = '';
      }
    });

  // Toggle campos Alquiler
  document.getElementById('rent').addEventListener('change', function () {
    const RentFields = document.getElementById('rent_fields');
    if (this.checked) {
      RentFields.classList.remove('d-none');
    } else {
      RentFields.classList.add('d-none');
      document.getElementById('rent_price').value = '';
      document.getElementById('rent_days').value = '';
    }
  });

  const contentForm = document.getElementById('form');
  const seoForm = document.getElementById('seo-form');
  const scriptsForm = document.getElementById('scripts-form');

  [contentForm, seoForm, scriptsForm].forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      if (!(await validateAddForm())) {
        return;
      }

      // Desactivar el botón mientras se procesa
      const btn = form.querySelector("button[type='submit']");
      btn.disabled = true;

      try {
        // Resetear mensajes de error
        document
          .querySelectorAll('#form .invalid-feedback')
          .forEach((el) => (el.textContent = ''));
        document.querySelectorAll('.success-submit').forEach((element) => {
          element.classList.add('d-none');
        });

        // Mostrar loader
        document.getElementById('loading').classList.remove('d-none');

        // Crear FormData
        const formData = new FormData();

        formData.append('title', document.getElementById('title').value);
        formData.append('type', document.getElementById('type').value);
        formData.append('tagline', CKEDITOR.instances.tagline.getData());
        formData.append('overview', CKEDITOR.instances.overview.getData());

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

            const taglineInstance =
              CKEDITOR.instances[`${language.code}-tagline`];
            if (taglineInstance) {
              formData.append(
                `translations[${language.code}][tagline]`,
                taglineInstance.getData()
              );
            }

            const overviewInstance =
              CKEDITOR.instances[`${language.code}-overview`];
            if (overviewInstance) {
              formData.append(
                `translations[${language.code}][overview]`,
                overviewInstance.getData()
              );
            }
          }
        });

        formData.append(
          'pay_per_view',
          document.getElementById('pay_per_view').checked ? '1' : '0'
        );

        if (document.getElementById('pay_per_view').checked) {
          formData.append(
            'pay_per_view_price',
            document.getElementById('pay_per_view_price').value
          );
        }

        formData.append(
          'rent',
          document.getElementById('rent').checked ? '1' : '0'
        );

        if (document.getElementById('rent').checked) {
          formData.append(
            'rent_price',
            document.getElementById('rent_price').value
          );
          formData.append(
            'rent_days',
            document.getElementById('rent_days').value
          );
        }

        if (document.getElementById('start_time').value) {
          formData.append(
            'start_time',
            document.getElementById('start_time').value
          );
        }

        if (document.getElementById('end_time').value) {
          formData.append(
            'end_time',
            document.getElementById('end_time').value
          );
        }

        if (
          document.getElementById('duration') &&
          document.getElementById('duration').value
        ) {
          formData.append(
            'duration',
            document.getElementById('duration').value
          );
        }

        if (document.getElementById('cover')) {
          formData.append('cover', document.getElementById('cover').files[0]);
        }

        if (document.getElementById('tall-cover')) {
          formData.append(
            'tall_cover',
            document.getElementById('tall-cover').files[0]
          );
        }

        if (
          document.getElementById('trailer') &&
          document.getElementById('trailer').files[0]
        ) {
          formData.append(
            'trailer',
            document.getElementById('trailer').files[0]
          );
        }

        const type = document.getElementById('type').value;

        // Obtener checkboxes seleccionados
        const planCheckboxes = document.querySelectorAll(
          '#plans-container input[type="checkbox"]:checked'
        );
        planCheckboxes.forEach((checkbox) => {
          formData.append('plans[]', checkbox.value);
        });

        const categoryCheckboxes = document.querySelectorAll(
          '#categories-container input[type="checkbox"]:checked'
        );
        categoryCheckboxes.forEach((checkbox) => {
          formData.append('categories[]', checkbox.value);
        });

        const tagCheckboxes = document.querySelectorAll(
          '#tags-container input[type="checkbox"]:checked'
        );
        tagCheckboxes.forEach((checkbox) => {
          formData.append('tags[]', checkbox.value);
        });

        const genderCheckboxes = document.querySelectorAll(
          '#genders-container input[type="checkbox"]:checked'
        );
        genderCheckboxes.forEach((checkbox) => {
          formData.append('genders[]', checkbox.value);
        });

        const response = await fetch(`/api/add-serie`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          // Mostrar errores específicos si existen
          if (data.errors) {
            Object.entries(data.errors).forEach(([field, messages]) => {
              const errorElement = document.getElementById(`${field}-error`);
              if (errorElement) {
                errorElement.textContent = messages.join(', ');
                errorElement.style.display = 'block';
              }
            });
          } else {
            throw new Error(data.error || 'Error al subir el contenido');
          }
          return;
        }

        // Crear SEO si el usuario llenó datos
        if (seoForm.querySelectorAll('input, textarea').length > 0) {
          const { seoFormData, seo } = buildSeoFormData('movie');
          if (data.success && seo) {
            console.log(data);
            const seoResponse = await fetch(
              backendAPI + `create-seo-settings/${data.serie.id}`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
                body: seoFormData,
              }
            );

            const seoData = await seoResponse.json();
          }
        }
        // Crear Script (si el usuario llenó datos)
        if (scriptsForm.querySelectorAll('input, textarea').length > 0) {
          const { scriptFormData: googleScriptFormData, script: googleScript } =
            buildScriptFormData('google');
          if (data.success && googleScript) {
            const scriptResponse = await fetch(
              backendAPI + `create-script/${data.serie.id}/movie`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
                body: googleScriptFormData,
              }
            );

            const scriptData = await scriptResponse.json();
          }
        }

        // Mostrar mensaje de éxito
        document.querySelectorAll('.success-submit').forEach((element) => {
          element.classList.remove('d-none');
        });

        setTimeout(() => {
          document.querySelectorAll('.success-submit').forEach((element) => {
            element.classList.add('d-none');
          });
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('Error:', error);
        alert('Error al subir el contenido: ' + error.message);
      } finally {
        document.getElementById('loading').classList.add('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  initContent();
});
