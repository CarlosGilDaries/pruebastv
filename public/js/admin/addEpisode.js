import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { validateAddForm } from '../modules/validateAddForm.js';
import { buildSeoFormData } from '../modules/buildSeoFormData.js';
import { buildSeoInputs } from '../modules/buildSeoInputs.js';
import { setupSlugGenerator } from '../modules/setUpSlugGeneratos.js';
import {
  buildScriptInputs,
  buildScriptFormData,
} from '../modules/buildScriptsSettings.js';
import { buildInputFromSerieType, buildSelectOptions } from '../modules/buildEpisodesForms.js';

buildSeoInputs();
buildScriptInputs();
setupSlugGenerator();

async function initAddEpisode() {
  const authToken = localStorage.getItem('auth_token');
  let slug = localStorage.getItem('serie-slug');
  let id = localStorage.getItem('serie-id');

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

  const response = await fetch(`/api/serie/${slug}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  if (data.serie.scripts.length != 0) {
    data.serie.scripts.forEach((script) => {
      if (script.type == 'google') {
        document.getElementById('google-code').value = script.code;
      }
    });
  }
  if (data.serie.seo_setting != null) {
    document.getElementById('seo-canonical').value =
      data.serie.seo_setting.canonical;
    document.getElementById('seo-keywords').value =
      data.serie.seo_setting.keywords;
    document.getElementById('seo-robots').value = data.serie.seo_setting.robots;
  }
  buildInputFromSerieType(data.serie.type);
  buildSelectOptions(data);

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
        formAdData.append('title', document.getElementById('title').value);
        languages.forEach((language) => {
          if (language.code !== 'es') {
            const titleValue = document.getElementById(
              `${language.code}-title`
            )?.value;
            if (titleValue) {
              formAdData.append(
                `translations[${language.code}][title]`,
                titleValue
              );
            }
          }
        });
        if (document.getElementById('cover')) {
          formAdData.append('cover', document.getElementById('cover').files[0]);
        }
        formAdData.append(
          'season_number',
          document.getElementById('season_number').value
        );
        formAdData.append(
          'episode_number',
          document.getElementById('episode_number').value
        );
        formAdData.append('duration', document.getElementById('duration').value);
        if (document.getElementById('single-content')) {
          formAdData.append(
            'content',
            document.getElementById('content').files[0]
          );
        }
        if (document.getElementById('hls-content')) {
          formAdData.append('m3u8', document.getElementById('m3u8').files[0]);
          formAdData.append('ts1', document.getElementById('ts1').files[0]);
          formAdData.append('ts2', document.getElementById('ts2').files[0]);
          formAdData.append('ts3', document.getElementById('ts3').files[0]);
        }
        if (document.getElementById('external_url')) {
          formAdData.append(
            'external_url',
            document.getElementById('external_url').value
          );
        }

        const response = await fetch(`/api/add-episode/${id}`, {
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
          const { seoFormData, seo } = buildSeoFormData('episode');
          if (data.success && seo) {
            const seoResponse = await fetch(
              `/api/create-seo-settings/${data.episode.id}`,
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
              `/api/create-script/${data.episode.id}/episode`,
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
      } finally {
        document.getElementById('loading').classList.add('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  initAddEpisode();
});
