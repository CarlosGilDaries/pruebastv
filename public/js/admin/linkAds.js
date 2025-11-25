import {
  linkedAds,
  updateAvailableAds,
} from '../modules/singleContentWithAds.js';

async function linkAds() {
  const backendAPI = '/api/';
  const authToken = localStorage.getItem('auth_token');
  const table = document.getElementById('ads-table');
  const unlinkMessage = document.getElementById('unlink-success-message');
  let id = localStorage.getItem('id');
  let title = localStorage.getItem('title');
  let h1Element = document.getElementById('link-movie-title');
  h1Element.innerHTML = '<i class="fas fa-film me-2"></i> ' + title;
    let type = localStorage.getItem('type');
    let linkAdsApi;
    let contentWithAdsApi;
    let episode;

    if (type == 'episode') {
      linkAdsApi = '/api/link-episode-ads';
      contentWithAdsApi = `/api/episode-with-ads/${id}`;
      episode = true;
    } else {
      linkAdsApi = '/api/link-ads';
      contentWithAdsApi = `/api/content-with-ads/${id}`;
      episode = false;
    }

  if (!authToken) {
    window.location.href = '/login';
    return;
  }

  // Cargar datos iniciales
  loadInitialData();

  async function loadInitialData() {
    try {
      const linkedAdIds = await linkedAds(
        id,
        authToken,
        table,
        unlinkMessage,
        episode
      );

      // Cargar anuncios
      const adsResponse = await fetch(backendAPI + 'ads', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const adsData = await adsResponse.json();

      if (adsData.success) {
        const adsContainer = document.getElementById('link-ads-container');

        const unlinkedAds = adsData.data.filter(
          (ad) => !linkedAdIds.includes(ad.id)
        );

        const table = $('#ads-datatable').DataTable({
          responsive: true,
          columns: [
            {
              data: null,
              orderable: false,
              className: 'select-checkbox',
              defaultContent: '',
              render: function (data, type, row) {
                return `
								<label class="checkbox-container-linkads">
									<input type="checkbox" name="ads[${row.id}][id]" value="${row.id}" id="ad-${row.id}" class="ad-checkbox">
									<span class="checkmark-linkads"></span>
                           	 	</label>
								`;
              },
            },
            { data: 'brand' },
            { data: 'title' },
            {
              data: null,
              render: function (data, type, row) {
                return `
                        <select name="ads[${row.id}][type]" class="ad-options ad-type" style="display: none;">
                            <option value="preroll">Preroll</option>
                            <option value="midroll">Midroll</option>
                            <option value="postroll">Postroll</option>
                            <option value="overlay">Overlay</option>
                        </select>
                        <div class="error-message type-error"></div>
                    `;
              },
            },
            {
              data: null,
              render: function (data, type, row) {
                return `
                        <select name="ads[${row.id}][skippable]" class="ad-options skip-option" style="display: none;">
                            <option value="0">No</option>
                            <option value="1">Sí</option>
                        </select>
                        <div class="error-message skippable-error"></div>
                    `;
              },
            },
            {
              data: null,
              render: function (data, type, row) {
                return `
                        <input type="number" name="ads[${row.id}][midroll_time]" class="midroll-time" placeholder="Tiempo para midroll" style="display: none;">
                        <div class="error-message midroll_time-error"></div>
                        <input type="number" name="ads[${row.id}][skip_time]" id="skip-time-${row.id}" class="skip-time" placeholder="Tiempo para saltar" style="display: none;">
                        <div class="error-message skip_time-error"></div>
                    `;
              },
            },
          ],
          language: {
            url: '//datatables-cdn.com/plug-ins/1.10.25/i18n/Spanish.json',
            paginate: {
              first: `<span class="icon-pagination">«</span>`,
              previous: `<span class="icon-pagination">‹</span>`,
              next: `<span class="icon-pagination">›</span>`,
              last: `<span class="icon-pagination">»</span>`,
            },
          },
          data: unlinkedAds,
          createdRow: function (row, data, dataIndex) {
            const $row = $(row);

            // Checkbox change
            $row.find('.ad-checkbox').change(function () {
              const isChecked = $(this).is(':checked');

              $row
                .find('.ad-options')
                .css('display', isChecked ? 'block' : 'none');

              if (!isChecked) {
                $row.find('.ad-type').val('preroll');
                $row.find('.skip-option').val('0');
                // Limpiar y resetear completamente los campos
                $row
                  .find('.midroll-time, .skip-time')
                  .val('')
                  .removeProp('required')
                  .removeAttr('required')
                  .css('display', 'none');
              }

              updateRequiredFields();
            });

            // Ad type change
            $row.find('.ad-type').change(function () {
              // Si cambia de midroll a otra cosa, limpiamos el campo
              if ($(this).val() !== 'midroll') {
                $row
                  .find('.midroll-time')
                  .val('')
                  .removeProp('required')
                  .removeAttr('required');
              }
              updateRequiredFields();
            });

            // Skippable change
            $row.find('.skip-option').change(function () {
              // Si cambia de sí a no, limpiamos el campo
              if ($(this).val() !== '1') {
                $row
                  .find('.skip-time')
                  .val('')
                  .removeProp('required')
                  .removeAttr('required');
              }
              updateRequiredFields();
            });

            // Función para actualizar required fields
            const updateRequiredFields = () => {
              const isChecked = $row.find('.ad-checkbox').is(':checked');
              const adType = $row.find('.ad-type').val();
              const isSkippable = $row.find('.skip-option').val() === '1';

              // Midroll Time
              const $midrollTime = $row.find('.midroll-time');
              if (isChecked && adType === 'midroll') {
                $midrollTime.prop('required', true).css('display', 'block');
              } else {
                $midrollTime
                  .removeProp('required')
                  .removeAttr('required')
                  .css('display', 'none');
              }

              // Skip Time
              const $skipTime = $row.find('.skip-time');
              if (isChecked && isSkippable) {
                $skipTime.prop('required', true).css('display', 'block');
              } else {
                $skipTime
                  .removeProp('required')
                  .removeAttr('required')
                  .css('display', 'none');
              }
            };

            // Inicializar
            updateRequiredFields();
          },
        });
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      const errorElement = document.getElementById('link-content_id-error');
      if (errorElement) {
        errorElement.textContent =
          'Error cargando los datos. Por favor recarga la página.';
      }
    }
  }

  // Manejar envío del formulario
  document
    .getElementById('link-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Resetear mensajes de error
      $('.error-message').text('');
      $('#link-success-message').hide();

      // Mostrar loader
      $('#link-loading').show();

      // Preparar datos del formulario
      const formData = {
        content_id: id,
        ads: {},
      };

      // Recopilar anuncios seleccionados
      $('#ads-datatable tbody tr').each(function () {
        const checkbox = $(this).find('.ad-checkbox');
        if (checkbox.is(':checked')) {
          const adId = checkbox.val();

          formData.ads[adId] = {
            id: adId,
            type: $(this).find('.ad-type').val(),
            skippable: $(this).find('.skip-option').val(),
            skip_time: $(this).find('.skip-time').val() || null,
            midroll_time: $(this).find('.midroll-time').val() || null,
          };
        }
      });

      try {
        const response = await fetch(linkAdsApi, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.success) {
          document.getElementById('link-success-message').style.display =
            'block';
          document.getElementById('link-success-message').textContent =
            data.message || 'Anuncios vinculados correctamente!';

          setTimeout(() => {
            document.getElementById('link-success-message').style.display =
              'none';
          }, 5000);

          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Actualizar la tabla de anuncios vinculados
          const linkedResponse = await linkedAds(
            id,
            authToken,
            table,
            unlinkMessage,
            episode
          );
          // Actualizar los checkboxes disponibles
          await updateAvailableAds(id, authToken, contentWithAdsApi);
          // Resetear el formulario
          document.getElementById('link-form').reset();
        }
      } catch (error) {
        console.error('Error:', error);

        // Mostrar error general si no es de validación
        if (!error.message.includes('Por favor corrige')) {
          const errorElement = document.getElementById('link-content_id-error');
          if (errorElement) {
            errorElement.textContent = error.message;
          }
        }

        // Manejar error de conexión
        if (error.message.includes('Failed to fetch')) {
          const errorElement = document.getElementById('link-content_id-error');
          if (errorElement) {
            errorElement.textContent =
              'Error de conexión con el servidor. Por favor intenta nuevamente.';
          }
        }
      } finally {
        document.getElementById('link-loading').style.display = 'none';
      }
    });
}

linkAds();
