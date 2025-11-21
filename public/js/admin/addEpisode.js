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

async function initAddEpisode() {
  const authToken = localStorage.getItem('auth_token');
  const selectSeasons = document.getElementById('season_number');
  const selectEpisodes = document.getElementById('episode_number');
  let slug = localStorage.getItem('slug');
  let id = localStorage.getItem('id');

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

function buildInputFromSerieType(serieType) {
  let inputs;
  if (serieType == 'video/mp4' || serieType == 'audio/mpeg') {
    if (serieType == 'video/mp4') {
      document.getElementById('type').value = 'video/mp4';
    } else {
      document.getElementById('type').value = 'audio/mpeg';
    }

    inputs = `
                <div id="single-content" class="mb-3">
                  <label for="content" class="form-label"
                    >Archivo de contenido</label
                  >
                  <div class="input-group">
                    <input
                      type="file"
                      class="form-control"
                      id="content"
                      name="content"
                      required
                    />
                  </div>
                  <div id="content-error" class="invalid-feedback"></div>
                </div>
                `;
  } else if (serieType == 'application/vnd.apple.mpegurl') {
    document.getElementById('type').value = 'application/vnd.apple.mpegurl';

    inputs = `
                <div id="hls-content">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="m3u8" class="form-label">Archivo .m3u8</label>
                      <div class="input-group">
                        <input
                          type="file"
                          class="form-control"
                          id="m3u8"
                          name="m3u8"
                          accept=".m3u8"
                          required
                        />
                      </div>
                      <div id="m3u8-error" class="invalid-feedback"></div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="ts1" class="form-label"
                        >Playlist 1 (.zip)</label
                      >
                      <div class="input-group">
                        <input
                          type="file"
                          class="form-control"
                          id="ts1"
                          name="ts1"
                          accept=".zip"
                          required
                        />
                      </div>
                      <div id="ts1-error" class="invalid-feedback"></div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="ts2" class="form-label"
                        >Playlist 2 (.zip)</label
                      >
                      <div class="input-group">
                        <input
                          type="file"
                          class="form-control"
                          id="ts2"
                          name="ts2"
                          accept=".zip"
                          required
                        />
                      </div>
                      <div id="ts2-error" class="invalid-feedback"></div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="ts3" class="form-label"
                        >Playlist 3 (.zip)</label
                      >
                      <div class="input-group">
                        <input
                          type="file"
                          class="form-control"
                          id="ts3"
                          name="ts3"
                          accept=".zip"
                          required
                        />
                      </div>
                      <div id="ts3-error" class="invalid-feedback"></div>
                    </div>
                  </div>
                </div>
                `;
  } else {
    if (serieType == 'stream') {
      document.getElementById('type').value = 'stream';
    } else if (serieType == 'url_mp3') {
      document.getElementById('type').value = 'url_mp3';
    } else if (serieType == 'url_mp4') {
      document.getElementById('type').value = 'url_mp4';
    } else if (serieType == 'url_hls') {
      document.getElementById('type').value = 'url_hls';
    }
    inputs = `
                <div id="external-content" class="mb-3">
                  <label for="external_url" class="form-label"
                    >URL del contenido</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="external_url"
                    name="external_url"
                    placeholder="https://..."
                    required
                  />
                  <div id="external_url-error" class="invalid-feedback"></div>
                </div>
                `;
  }

  document.getElementById('content-inputs').innerHTML = inputs;
}

function buildSelectOptions(data) {
  const episodes = data.episodes;
  const seasonsSelect = document.getElementById('season_number');
  const episodesSelect = document.getElementById('episode_number');

  if (Object.keys(episodes).length == 0) {
    const noSeasons = document.createElement('option');
    const firstSeason = document.createElement('option');
    noSeasons.value = 0;
    noSeasons.textContent = 0;
    firstSeason.value = 1;
    firstSeason.textContent = 1;

    seasonsSelect.appendChild(noSeasons);
    seasonsSelect.appendChild(firstSeason);
    
    seasonsSelect.addEventListener('change', function () {
        episodesSelect.disabled = false;
        episodesSelect.innerHTML = '';
        const firstEpisode = document.createElement('option');
        firstEpisode.value = 1;
        firstEpisode.textContent = 1;
        episodesSelect.appendChild(firstEpisode);
    });
  } else if (Object.keys(episodes).length != 0 && data.no_seasons) {
    const noSeasons = document.createElement('option');
    noSeasons.value = 0;
    noSeasons.textContent = 0;
    seasonsSelect.appendChild(noSeasons);
    Object.entries(episodes).forEach(([season, episodesList]) => {
      seasonsSelect.addEventListener('change', function () {
        episodesSelect.disabled = false;
        if (seasonsSelect.value == season) {
          episodesSelect.innerHTML = '';
          let episodeNumber = 1;
          episodesList.forEach((episode) => {
            const episodeOption = document.createElement('option');
            episodeOption.value = episodeNumber;
            episodeOption.textContent = episodeNumber;
            episodesSelect.appendChild(episodeOption);
            episodeNumber++;
          });
          const lastEpisode = document.createElement('option');
          lastEpisode.textContent = episodesList.length + 1;
          lastEpisode.value = episodesList.length + 1;
          episodesSelect.appendChild(lastEpisode);
        }
      });
    });
  } else {
    Object.entries(episodes).forEach(([season, episodesList]) => {
      const seasonOption = document.createElement('option');
      seasonOption.value = season;
      seasonOption.textContent = season;
      seasonsSelect.appendChild(seasonOption);
      seasonsSelect.addEventListener('change', function () {
        episodesSelect.disabled = false;
        if (seasonsSelect.value == season) {
          episodesSelect.innerHTML = '';
          let episodeNumber = 1;
          episodesList.forEach((episode) => {
            const episodeOption = document.createElement('option');
            episodeOption.value = episodeNumber;
            episodeOption.textContent = episodeNumber;
            episodesSelect.appendChild(episodeOption);
            episodeNumber++;
          });
          const lastEpisode = document.createElement('option');
          lastEpisode.textContent = episodesList.length + 1;
          lastEpisode.value = episodesList.length + 1;
          episodesSelect.appendChild(lastEpisode);
        } else {
          episodesSelect.innerHTML = '';
          const firstEpisode = document.createElement('option');
          firstEpisode.textContent = 1;
          firstEpisode.value = 1;
          episodesSelect.appendChild(firstEpisode);
        }
      });
    });
    const lastSeason = document.createElement('option');
    lastSeason.textContent = Object.keys(episodes).length + 1;
    lastSeason.value = Object.keys(episodes).length + 1;
    seasonsSelect.appendChild(lastSeason);
  }
}
