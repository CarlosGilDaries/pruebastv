import { linkedAds, updateAvailableAds } from "./singleContentWithAds.js";

async function linkAds() {
	const backendAPI = 'https://pruebastv.kmc.es/api/';
	const authToken = localStorage.getItem('auth_token');
	const table = document.getElementById('ads-table');
	const unlinkMessage = document.getElementById('unlink-success-message');
	let id = localStorage.getItem('id');      
    let title = localStorage.getItem('title');
    let h1Element = document.getElementById('link-movie-title');
	h1Element.innerHTML = title;

    if (!authToken) {
      window.location.href = '/login';
      return;
      }

    // Cargar datos iniciales
    loadInitialData();
	
	// Escuchar cuando se muestra este contenido
    document
      .getElementById('link-content-with-ads')
      .addEventListener('show', function () {
		id = localStorage.getItem('id');
		title = localStorage.getItem('title');
		h1Element.innerHTML = title;
		document.getElementById('link-ads-container').textContent = "";
        loadInitialData();
      });
	
	 async function loadInitialData() {
    try {
      const linkedAdIds = await linkedAds(id, backendAPI, authToken, table, unlinkMessage);

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

        unlinkedAds.forEach((ad) => {
          const adGroup = document.createElement('div');
          adGroup.className = 'ad-group';
          adGroup.innerHTML = `
                            <input type="checkbox" name="ads[${ad.id}][id]" value="${ad.id}" id="ad-${ad.id}" class="ad-checkbox">
                            <strong>${ad.title}</strong>
                            <div class="error-message" id="ad-${ad.id}-error"></div>
                            
                            <select name="ads[${ad.id}][type]" class="ad-options ad-type" style="display: none;">
                                <option value="preroll">Preroll</option>
                                <option value="midroll">Midroll</option>
                                <option value="postroll">Postroll</option>
                                <option value="overlay">Overlay</option>
                            </select>
                            <div class="error-message type-error"></div>
                            
                            <input type="number" name="ads[${ad.id}][midroll_time]" class="midroll-time" placeholder="Tiempo en segundos" style="display: none;">
                            <div class="error-message midroll_time-error"></div>
                            
                            <select name="ads[${ad.id}][skippable]" class="ad-options skip-option" style="display: none;">
                                <option value="0">Saltar anuncio: No</option>
                                <option value="1">Saltar anuncio: Sí</option>
                            </select>
                            <div class="error-message skippable-error"></div>
                            
                            <input type="number" name="ads[${ad.id}][skip_time]" class="skip-time" placeholder="Tiempo en segundos" style="display: none;">
                            <div class="error-message skip_time-error"></div>
                        `;
          adsContainer.appendChild(adGroup);

          // Event listener para mostrar/ocultar opciones cuando se selecciona un anuncio
          document
            .getElementById(`ad-${ad.id}`)
            .addEventListener('change', function () {
              const options =
                this.closest('.ad-group').querySelectorAll('.ad-options');
              options.forEach((option) => {
                option.style.display = this.checked ? 'block' : 'none';
              });
            });

          // Event listener para mostrar/ocultar campo según el tipo de anuncio
          adGroup
            .querySelector('.ad-type')
            .addEventListener('change', function () {
              const midrollTime =
                this.closest('.ad-group').querySelector('.midroll-time');
              midrollTime.style.display =
                this.value === 'midroll' ? 'block' : 'none';
            });

          // Event listener para mostrar/ocultar campo según skippable
          adGroup
            .querySelector('.skip-option')
            .addEventListener('change', function () {
              const skipTime =
                this.closest('.ad-group').querySelector('.skip-time');
              skipTime.style.display = this.value === '1' ? 'block' : 'none';
            });
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
        document
          .querySelectorAll('#link-form .error-message')
          .forEach((el) => (el.textContent = ''));
        document.getElementById('link-success-message').style.display = 'none';

        // Mostrar loader
        document.getElementById('link-loading').style.display = 'block';

        // Preparar datos del formulario
        const formData = {
          content_id: id,
          ads: {},
        };

        // Recopilar anuncios seleccionados
        document
          .querySelectorAll('#link-form .ad-checkbox:checked')
          .forEach((checkbox) => {
            const adId = checkbox.value;
            const adGroup = checkbox.closest('.ad-group');

            formData.ads[adId] = {
              id: adId,
              type: adGroup.querySelector('.ad-type').value,
              skippable: adGroup.querySelector('.skip-option').value,
              skip_time: adGroup.querySelector('.skip-time').value || null,
              midroll_time:
                adGroup.querySelector('.midroll-time').value || null,
            };
          });

        try {
          const response = await fetch(backendAPI + 'link-ads', {
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
              backendAPI,
              authToken,
              table,
              unlinkMessage
            );
            // Actualizar los checkboxes disponibles
            await updateAvailableAds(id, authToken, backendAPI);
            // Resetear el formulario
            document.getElementById('link-form').reset();
          }
        } catch (error) {
          console.error('Error:', error);

          // Mostrar error general si no es de validación
          if (!error.message.includes('Por favor corrige')) {
            const errorElement = document.getElementById(
              'link-content_id-error'
            );
            if (errorElement) {
              errorElement.textContent = error.message;
            }
          }

          // Manejar error de conexión
          if (error.message.includes('Failed to fetch')) {
            const errorElement = document.getElementById(
              'link-content_id-error'
            );
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

