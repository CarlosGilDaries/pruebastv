const backendAPI = 'https://streaming.test/api/';

document.addEventListener('DOMContentLoaded', async function () {
  // Obtener token de autenticación
  const authToken = localStorage.getItem('auth_token');
  if (!authToken) {
    window.location.href = '/login';
    return;
  }

  // Cargar datos iniciales
  await loadInitialData(authToken);

  // Manejar envío del formulario
  document
    .getElementById('link-ads-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Resetear mensajes de error
      document
        .querySelectorAll('.error-message')
        .forEach((el) => (el.textContent = ''));
      document.getElementById('success-message').style.display = 'none';

      // Mostrar loader
      document.getElementById('loading').style.display = 'block';

      // Preparar datos del formulario
      const formData = {
        content_id: document.getElementById('content_id').value,
        ads: {},
      };

      // Recopilar anuncios seleccionados
      document.querySelectorAll('.ad-checkbox:checked').forEach((checkbox) => {
        const adId = checkbox.value;
        const adGroup = checkbox.closest('.ad-group');

        formData.ads[adId] = {
          id: adId,
          type: adGroup.querySelector('.ad-type').value,
          skippable: adGroup.querySelector('.skip-option').value,
          skip_time: adGroup.querySelector('.skip-time').value || null,
          midroll_time: adGroup.querySelector('.midroll-time').value || null,
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

        /*if (!response.ok) {
          // Manejar errores de validación de Laravel
          if (data.errors) {
            for (const [field, messages] of Object.entries(data.errors)) {
              // Manejar errores de anuncios
              if (field.startsWith('ads.')) {
                const parts = field.split('.');
                const adId = parts[1];
                const fieldName = parts[2];

                const errorElement = document
                  .querySelector(`.ad-group input[value="${adId}"]`)
                  ?.closest('.ad-group')
                  ?.querySelector(`.${fieldName}-error`);

                if (errorElement) {
                  errorElement.textContent = messages[0];
                }
              } else {
                // Manejar errores generales
                const errorElement = document.getElementById(`${field}-error`);
                if (errorElement) {
                  errorElement.textContent = messages[0];
                }
              }
            }
            throw new Error('Por favor corrige los errores en el formulario');
          }
          throw new Error(data.message || 'Error al vincular los anuncios');
        }*/

        // Mostrar mensaje de éxito
        document.getElementById('success-message').style.display = 'block';
        document.getElementById('success-message').textContent =
          data.message || 'Anuncios vinculados correctamente!';
      } catch (error) {
        console.error('Error:', error);

        // Mostrar error general si no es de validación
        if (!error.message.includes('Por favor corrige')) {
          const errorElement = document.getElementById('content_id-error');
          if (errorElement) {
            errorElement.textContent = error.message;
          }
        }

        // Manejar error de conexión
        if (error.message.includes('Failed to fetch')) {
          const errorElement = document.getElementById('content_id-error');
          if (errorElement) {
            errorElement.textContent =
              'Error de conexión con el servidor. Por favor intenta nuevamente.';
          }
        }
      } finally {
        document.getElementById('loading').style.display = 'none';
      }
    });
});

async function loadInitialData(authToken) {
  try {
    // Cargar contenidos
    const moviesResponse = await fetch(backendAPI + 'content', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const moviesData = await moviesResponse.json();

    if (moviesData.success) {
      const contentSelect = document.getElementById('content_id');
      moviesData.data.forEach((movie) => {
        const option = document.createElement('option');
        option.value = movie.id;
        option.textContent = movie.title;
        contentSelect.appendChild(option);
      });
    }

    // Cargar anuncios
    const adsResponse = await fetch(backendAPI + 'ads', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const adsData = await adsResponse.json();

    if (adsData.success) {
      const adsContainer = document.getElementById('ads-container');
      adsData.data.forEach((ad) => {
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
    const errorElement = document.getElementById('content_id-error');
    if (errorElement) {
      errorElement.textContent =
        'Error cargando los datos. Por favor recarga la página.';
    }
  }
}
