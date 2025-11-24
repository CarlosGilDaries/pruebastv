export function buildInputFromSerieType(serieType, edit = false) {
  let inputs;
  let required;
  if (edit) {
    required = '';
  } else {
    required = 'required';
  }
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
                      ${required}
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
                          ${required}
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
                          ${required}
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
                          ${required}
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
                          ${required}
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
                    ${required}
                  />
                  <div id="external_url-error" class="invalid-feedback"></div>
                </div>
                `;
  }

  document.getElementById('content-inputs').innerHTML = inputs;
}

export function buildSelectOptions(data) {
  const episodes = data.episodes || {};
  const seasonsSelect = document.getElementById('season_number');
  const episodesSelect = document.getElementById('episode_number');

  seasonsSelect.innerHTML = '<option disabled>Selecciona Nº Temporada</option>';
  episodesSelect.innerHTML = '<option disabled>Selecciona Primero Nº Temporada</option>';
  episodesSelect.disabled = true;

  // ----------------------------
  //   CREAR OPTIONS DE TEMPORADA
  // ----------------------------

  const seasonNumbers = Object.keys(episodes).map(Number);

  if (seasonNumbers.length === 0) {
    // No existen temporadas todavía
    addOption(seasonsSelect, 0);
    addOption(seasonsSelect, 1);
  } else {
    // Agregar temporadas ya existentes
    seasonNumbers.forEach((season) => addOption(seasonsSelect, season));

    // Agregar una temporada nueva al final
    const nextSeason = seasonNumbers.length + 1;
    addOption(seasonsSelect, nextSeason);
  }

  // ----------------------------
  //  LISTENER ÚNICO DEL SELECT
  // ----------------------------
  seasonsSelect.addEventListener('change', () => {
    const season = Number(seasonsSelect.value);

    episodesSelect.disabled = false;
    episodesSelect.innerHTML = '';

    // Si es temporada nueva, solo incluir episodio 1
    if (!episodes[season]) {
      addOption(episodesSelect, 1);
      return;
    }

    // Temporada existente → cargar sus episodios
    const episodeCount = episodes[season].length;

    for (let i = 1; i <= episodeCount; i++) {
      addOption(episodesSelect, i);
    }

    // Opción para crear un episodio nuevo al final
    addOption(episodesSelect, episodeCount + 1);
  });
}

// Utilidad simple para crear option
function addOption(select, value) {
  const opt = document.createElement('option');
  opt.value = value;
  opt.textContent = value;
  select.appendChild(opt);
}