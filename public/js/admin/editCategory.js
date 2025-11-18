import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { getContentTranslations } from '../modules/contentTranslations.js';
import { validateAddForm } from '../modules/validateAddForm.js';
import { buildSeoFormData } from '../modules/buildSeoFormData.js';
import { getSeoSettingsValues } from '../modules/getSeoSettingsValues.js';
import { buildSeoInputs } from '../modules/buildSeoInputs.js';
import { setupSlugGenerator } from '../modules/setUpSlugGeneratos.js';
import {
  buildScriptInputs,
  buildScriptFormData,
  getScriptValues,
} from '../modules/buildScriptsSettings.js';

buildSeoInputs();
buildScriptInputs();
setupSlugGenerator();

async function editCategoryForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const select = document.getElementById('priority');

  generateTranslationInputs(token);

  await loadCategoryData(id);

  // Manejar el envío del formulario
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
        const formAdData = new FormData();
        formAdData.append('name', document.getElementById('name').value);
        formAdData.append('priority', document.getElementById('priority').value);
        formAdData.append(
          'render_at_index',
          document.getElementById('render').checked ? '1' : '0'
        );

        const languagesResponse = await fetch(`/api/all-languages`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const languagesData = await languagesResponse.json();
        const languages = languagesData.languages;

        languages.forEach((language) => {
          if (language.code !== 'es') {
            const nameValue = document.getElementById(
              `${language.code}-name`
            )?.value;
            if (nameValue) {
              formAdData.append(
                `translations[${language.code}][name]`,
                nameValue
              );
            }
          }
        });
        if (document.getElementById('cover')) {
          formAdData.append('cover', document.getElementById('cover').files[0]);
        }
        const response = await fetch(backendAPI + `edit-category/${id}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formAdData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al añadir la etiqueta');
        }

        // Crear SEO si el usuario llenó datos
        if (seoForm.querySelectorAll('input, textarea').length > 0) {
          const { seoFormData, seo } = buildSeoFormData('category');
          if (data.success && seo) {
            let seoResponse;
            if (data.category.seo_setting_id == null) {
              seoResponse = await fetch(
                backendAPI + `create-seo-settings/${data.category.id}`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: seoFormData,
                }
              );
            } else {
              seoResponse = await fetch(
                backendAPI +
                `edit-seo-settings/${data.category.seo_setting_id}/${data.category.id}`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: seoFormData,
                }
              );
            }
            const seoData = await seoResponse.json();
          }
        }
        // Crear Script (si el usuario llenó datos)
        if (scriptsForm.querySelectorAll('input, textarea').length > 0) {
          const { scriptFormData: googleScriptFormData, script: googleScript } =
            buildScriptFormData('google');
          if (data.success && googleScript) {
            if (data.category.scripts.length != 0) {
              const scripts = data.category.scripts;
              let googleScriptId;
              scripts.forEach((script) => {
                if (script.category_id == data.category.id) {
                  googleScriptId = script.id;
                }
              });

              const googleScriptResponse = await fetch(
                backendAPI + `edit-script/${googleScriptId}`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: googleScriptFormData,
                }
              );
              const googleScriptData = await googleScriptResponse.json();
            } else {
              const scriptResponse = await fetch(
                backendAPI + `create-script/${data.category.id}/category`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: googleScriptFormData,
                }
              );

              const scriptData = await scriptResponse.json();
            }
          }
        }

        // Mostrar mensaje de éxito
        document.querySelectorAll('.success-submit').forEach((element) => {
          element.classList.remove('d-none');
        });

        setTimeout(() => {
          document.querySelectorAll('.success-submit').forEach((element) => {
            element.classList.add('d-none');
            btn.disabled = false;
          });
        }, 2000);
      } catch (error) {
        console.error('Error:', error);
        // Mostrar error al usuario
        const errorElement = document.getElementById('name-error');
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
      } finally {
        document.getElementById('loading').classList.add('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  async function loadCategoryData(id) {
    try {
      // Cargar prioridades disponibles
      const priorityResponse = await fetch(backendAPI + 'categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const languagesResponse = await fetch(`/api/all-languages`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!priorityResponse.ok) {
        throw new Error('Error al cargar las prioridades');
      }

      const priorityData = await priorityResponse.json();
      const priorities = priorityData.priorities;
      const languagesData = await languagesResponse.json();
      const languages = languagesData.languages;

      // Limpiar y llenar select de prioridades
      select.innerHTML =
        '<option value="" disabled selected>Selecciona prioridad</option>';
      priorities.forEach((priority) => {
        const option = document.createElement('option');
        option.textContent = priority;
        option.value = priority;
        select.appendChild(option);
      });

      // Cargar datos de la categoría
      const response = await fetch(`${backendAPI}category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos de la categoría');
      }

      const data = await response.json();

      if (data.success && data.category) {
        document.getElementById('name').value = data.category.name || '';
        getContentTranslations(languages, id);
        document.getElementById('priority').value =
          data.category.priority || '';
        document.getElementById('render').checked =
          data.category.render_at_index === 1;
        if (data.category.seo_setting != null) {
          getSeoSettingsValues(data.category.seo_setting);
        }
        if (data.category.scripts.length != 0) {
          const scripts = data.category.scripts;
          scripts.forEach((script) => {
            getScriptValues(script);
          });
        }
      } else {
        throw new Error(data.message || 'Error al cargar la categoría');
      }
    } catch (error) {
      console.error('Error:', error);
      // Mostrar error al usuario
      const errorElement = document.createElement('div');
      errorElement.className = 'alert alert-danger mt-3';
      errorElement.textContent = error.message;
      document.getElementById('form').prepend(errorElement);
      setTimeout(() => errorElement.remove(), 5000);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  editCategoryForm();
});
