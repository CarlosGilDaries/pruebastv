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

async function editGenderForm() {
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const id = localStorage.getItem('id');

  generateTranslationInputs(token);

  await loadGenderData(id);

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
        const response = await fetch(backendAPI + `edit-gender/${id}`, {
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
          const { seoFormData, seo } = buildSeoFormData('gender');
          if (data.success && seo) {
            let seoResponse;
            if (data.gender.seo_setting_id == null) {
              seoResponse = await fetch(
                backendAPI + `create-seo-settings/${data.gender.id}`,
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
                  `edit-seo-settings/${data.gender.seo_setting_id}/${data.gender.id}`,
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
            if (data.gender.scripts.length != 0) {
              const scripts = data.gender.scripts;
              let googleScriptId;
              scripts.forEach((script) => {
                if (script.gender_id == data.gender.id) {
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
                backendAPI + `create-script/${data.gender.id}/gender`,
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
        if (data.gender.seo_setting != null) {
          getSeoSettingsValues(data.gender.seo_setting);
        }
        if (data.gender.scripts.length != 0) {
          const scripts = data.gender.scripts;
          scripts.forEach((script) => {
            getScriptValues(script);
          });
        }
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  editGenderForm();
});
