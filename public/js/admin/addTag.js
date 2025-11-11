import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { validateAddForm } from '../modules/validateAddForm.js';
import { buildSeoFormData } from '../modules/buildSeoFormData.js';
import { buildSeoInputs } from '../modules/buildSeoInputs.js';
import { setupSlugGenerator } from '../modules/setUpSlugGeneratos.js';
import {
  buildScriptInputs,
  buildScriptFormData,
} from '../modules/buildScriptsSettings.js';

buildSeoInputs();
buildScriptInputs();
setupSlugGenerator();

async function initAddTag() {
  const backendAPI = '/api/';

  // Obtener token de autenticación
  const authToken = localStorage.getItem('auth_token');
  if (!authToken) {
    window.location.href = '/login';
    return;
  }

  generateTranslationInputs(authToken);

  const languagesResponse = await fetch(`/api/all-languages`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  const languagesData = await languagesResponse.json();
  const languages = languagesData.languages;

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
        const response = await fetch(backendAPI + 'add-tag', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formAdData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al añadir la etiqueta');
        }

        // Crear SEO si el usuario llenó datos
        if (seoForm.querySelectorAll('input, textarea').length > 0) {
          const { seoFormData, seo } = buildSeoFormData('tag');
          if (data.success && seo) {
            const seoResponse = await fetch(
              backendAPI + `create-seo-settings/${data.tag.id}`,
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
              backendAPI + `create-script/${data.tag.id}/tag`,
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  initAddTag();
});
