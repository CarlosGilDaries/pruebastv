(function () {
  async function initAddAd() {
    const backendAPI = 'https://pruebastv.kmc.es/api/';

    // Mostrar nombre de archivos seleccionados
    if (document.getElementById('ad-cover')) {
      document.getElementById('ad-cover').addEventListener('change', function (e) {
        const fileName =
          e.target.files[0]?.name || 'Ningún archivo seleccionado';
        document.getElementById('ad-cover-name').textContent = fileName;
        document.getElementById('ad-cover-label-text').textContent = fileName;
      });
    }

    document.getElementById('ad-file').addEventListener('change', function (e) {
      const fileName = e.target.files[0]?.name || 'Ningún archivo seleccionado';
      document.getElementById('ad-name').textContent = fileName;
      document.getElementById('ad-label-text').textContent = fileName;
    });

    document.getElementById('ad-m3u8').addEventListener('change', function (e) {
      const fileName = e.target.files[0]?.name || 'Ningún archivo seleccionado';
      document.getElementById('ad-m3u8-name').textContent = fileName;
      document.getElementById('ad-m3u8-label-text').textContent = fileName;
    });

    document.getElementById('ad-ts1').addEventListener('change', function (e) {
      const fileName = e.target.files[0]?.name || 'Ningún archivo seleccionado';
      document.getElementById('ad-ts1-name').textContent = fileName;
      document.getElementById('ad-ts1-label-text').textContent = fileName;
    });

    document.getElementById('ad-ts2').addEventListener('change', function (e) {
      const fileName = e.target.files[0]?.name || 'Ningún archivo seleccionado';
      document.getElementById('ad-ts2-name').textContent = fileName;
      document.getElementById('ad-ts2-label-text').textContent = fileName;
    });

    document.getElementById('ad-ts3').addEventListener('change', function (e) {
      const fileName = e.target.files[0]?.name || 'Ningún archivo seleccionado';
      document.getElementById('ad-ts3-name').textContent = fileName;
      document.getElementById('ad-ts3-label-text').textContent = fileName;
    });

    // Mostrar/ocultar campos según tipo de contenido
    document.getElementById('ad-type').addEventListener('change', function () {
      const type = this.value;
      const singleContent = document.getElementById('ad-single-content');
      const hlsContent = document.getElementById('ad-hls-content');

      if (type === 'application/vnd.apple.mpegurl') {
        singleContent.classList.add('hidden');
        hlsContent.classList.remove('hidden');
        document.getElementById('ad-file').required = false;
        document.getElementById('ad-m3u8').required = true;
      } else {
        singleContent.classList.remove('hidden');
        hlsContent.classList.add('hidden');
        document.getElementById('ad-file').required = true;
        document.getElementById('ad-m3u8').required = false;
      }
    });

    // Manejar envío del formulario
    document
      .getElementById('ad-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        // Resetear mensajes de error
        document
          .querySelectorAll('#ad-form .error-message')
          .forEach((el) => (el.textContent = ''));
        document.getElementById('ad-success-message').style.display = 'none';

        // Mostrar loader
        document.getElementById('ad-loading').style.display = 'block';

        // Obtener token de autenticación
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        // Crear FormData
        const formAdData = new FormData();
        formAdData.append('title', document.getElementById('ad-title').value);
        formAdData.append('brand', document.getElementById('ad-brand').value);
        formAdData.append('type', document.getElementById('ad-type').value);
        if (document.getElementById('ad-cover')) {
          formAdData.append(
            'cover',
            document.getElementById('ad-cover').files[0]
          );
        }

        const type = document.getElementById('ad-type').value;
        if (type === 'application/vnd.apple.mpegurl') {
          formAdData.append(
            'm3u8',
            document.getElementById('ad-m3u8').files[0]
          );
          formAdData.append('ts1', document.getElementById('ad-ts1').files[0]);
          formAdData.append('ts2', document.getElementById('ad-ts2').files[0]);
          formAdData.append('ts3', document.getElementById('ad-ts3').files[0]);
        } else {
          formAdData.append(
            'content',
            document.getElementById('ad-file').files[0]
          );
        }

        try {
          const response = await fetch(backendAPI + 'add-ad', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formAdData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error al subir el anuncio');
          }

          // Mostrar mensaje de éxito
          document.getElementById('ad-success-message').style.display = 'block';
          setTimeout(() => {
            document.getElementById('ad-success-message').style.display =
              'none';
          }, 5000);

          // Resetear formulario
          document.getElementById('ad-form').reset();
          document
            .querySelectorAll('#ad-form .file-name')
            .forEach((el) => (el.textContent = ''));
          document.querySelectorAll('#ad-form .file-input-label span').forEach((el) => {
            el.textContent = 'Seleccionar archivo...';
          });
        } catch (error) {
          console.error('Error:', error);
        } finally {
          document.getElementById('ad-loading').style.display = 'none';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }
  
  // Verificar si el DOM está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAddAd);
  } else {
    initAddAd();
  }
})();


