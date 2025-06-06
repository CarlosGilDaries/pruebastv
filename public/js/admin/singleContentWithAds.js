export async function linkedAds(id, token, ads_table, message) {
  try {
    const response = await fetch(`/api/content-with-ads/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    if (data.success) {
      let movieId = data.data.movie.id;
      let ads = data.data.movie.ads;
      ads_table.innerHTML = generateAdsTable(ads, movieId);
      setupUnlinkButtons(token, id, message);

      return ads.map((ad) => ad.id);
    }
    return [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

function generateAdsTable(ads, movieId) {
  if (!ads || ads.length === 0) {
    return '<p>No hay anuncios vinculados a este contenido.</p>';
  }

  let tableHTML = `
        <table class="ads-table">
            <thead>
                <tr>
                    <th>Anuncio</th>
                    <th>Tipo</th>
                    <th>Tiempo Midroll</th>
                    <th>Saltable</th>
                    <th>Skip Time</th>
                    <th>Desvincular</th>
                </tr>
            </thead>
            <tbody>
    `;

  ads.forEach((ad) => {
    tableHTML += `
            <tr data-ad-id="${ad.id}">
                <td>${ad.title}</td>
                <td>${ad.pivot.type}</td>
                <td>${ad.pivot.midroll_time || '-'}</td>
                <td>${ad.pivot.skippable ? 'Sí' : 'No'}</td>
                <td>${ad.pivot.skip_time || '-'}</td>
                <td>
                    <button class="unlink-btn" 
                            data-content-id="${movieId}" 
                            data-ad-id="${ad.id}">
                        Desvincular
                    </button>
                </td>
            </tr>
        `;
  });

  tableHTML += `
            </tbody>
        </table>
    `;

  return tableHTML;
}

function setupUnlinkButtons(token, id, message) {
  document.querySelectorAll('.unlink-btn').forEach((button) => {
    button.addEventListener('click', async function () {
      const contentId = this.getAttribute('data-content-id');
      const adId = this.getAttribute('data-ad-id');

      if (confirm('¿Estás seguro de que deseas desvincular este anuncio?')) {
        try {
          const response = await fetch(
            '/api/content-with-ads-destroy',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                content_id: contentId,
                ad_id: adId,
              }),
            }
          );

          const data = await response.json();

            if (data.success) {
            message.style.display = 'block';
            setTimeout(() => {
                message.style.display = 'none';
            }, 5000);

            window.scrollTo({ top: 0, behavior: 'smooth' });
            const newResponse = await fetch(
              `/api/content-with-ads/${id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const newData = await newResponse.json();

            if (newData.success) {
              document.getElementById('ads-table').innerHTML = generateAdsTable(
                newData.data.movie.ads,
                contentId
              );
              setupUnlinkButtons(token, id, message);
                await updateAvailableAds(id, token);
            }
          } else {
            alert(
              'Error al desvincular: ' + (data.message || 'Error desconocido')
            );
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Error de conexión al intentar desvincular');
        }
      }
    });
  });
}

export async function updateAvailableAds(id, token) {
  try {
    const linkedResponse = await fetch(
      `/api/content-with-ads/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const linkedData = await linkedResponse.json();
    const linkedAdIds = linkedData.success
      ? linkedData.data.movie.ads.map((ad) => ad.id)
      : [];

    const adsResponse = await fetch('/api/ads', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const adsData = await adsResponse.json();

    if (adsData.success) {
      const adsContainer = document.getElementById('link-ads-container');
      adsContainer.innerHTML = ''; 

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

        setupAdGroupEventListeners(adGroup, ad.id);
      });
    }
  } catch (error) {
    console.error('Error actualizando anuncios disponibles:', error);
  }
}

function setupAdGroupEventListeners(adGroup, adId) {
  document.getElementById(`ad-${adId}`).addEventListener('change', function () {
    const options = this.closest('.ad-group').querySelectorAll('.ad-options');
    options.forEach((option) => {
      option.style.display = this.checked ? 'block' : 'none';
    });
  });

  adGroup.querySelector('.ad-type').addEventListener('change', function () {
    const midrollTime =
      this.closest('.ad-group').querySelector('.midroll-time');
    midrollTime.style.display = this.value === 'midroll' ? 'block' : 'none';
  });

  adGroup.querySelector('.skip-option').addEventListener('change', function () {
    const skipTime = this.closest('.ad-group').querySelector('.skip-time');
    skipTime.style.display = this.value === '1' ? 'block' : 'none';
  });
}
