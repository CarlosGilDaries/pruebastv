document.addEventListener('DOMContentLoaded', function () {
  async function initAddAd() {
    const backendAPI = '/api/';
    const authToken = localStorage.getItem('auth_token');

    // Manejar cambio de tipo de contenido
    document.getElementById('ad-type').addEventListener('change', function () {
      const type = this.value;
      const singleContent = document.getElementById('ad-single-content');
      const hlsContent = document.getElementById('ad-hls-content');

      if (type === 'application/vnd.apple.mpegurl') {
        singleContent.classList.add('d-none');
        hlsContent.classList.remove('d-none');
        document.getElementById('ad-file').required = false;
        document.getElementById('ad-m3u8').required = true;
      } else {
        singleContent.classList.remove('d-none');
        hlsContent.classList.add('d-none');
        document.getElementById('ad-file').required = true;
        document.getElementById('ad-m3u8').required = false;
      }
    });

    // Manejar envío del formulario
    document
      .getElementById('ad-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validar formulario
        if (!this.checkValidity()) {
          e.stopPropagation();
          this.classList.add('was-validated');
          return;
        }

        // Resetear mensajes de error
        document
          .querySelectorAll('#ad-form .invalid-feedback')
          .forEach((el) => {
            el.textContent = '';
            el.style.display = 'none';
          });
        document.getElementById('ad-success-message').classList.add('d-none');

        // Mostrar loader
        document.getElementById('ad-loading').classList.remove('d-none');

        // Verificar autenticación
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        try {
          const formData = new FormData();
          formData.append('title', document.getElementById('ad-title').value);
          formData.append('brand', document.getElementById('ad-brand').value);
          formData.append('type', document.getElementById('ad-type').value);

          // Agregar archivo de imagen si existe
          const coverInput = document.getElementById('ad-cover');
          if (coverInput.files.length > 0) {
            formData.append('cover', coverInput.files[0]);
          }

          // Agregar archivos según el tipo seleccionado
          const type = document.getElementById('ad-type').value;
          if (type === 'application/vnd.apple.mpegurl') {
            ['m3u8', 'ts1', 'ts2', 'ts3'].forEach((field) => {
              const input = document.getElementById(`ad-${field}`);
              if (input.files.length > 0) {
                formData.append(field, input.files[0]);
              }
            });
          } else {
            const contentInput = document.getElementById('ad-file');
            if (contentInput.files.length > 0) {
              formData.append('content', contentInput.files[0]);
            }
          }

          const response = await fetch(backendAPI + 'add-ad', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            // Mostrar errores del servidor si existen
            if (data.errors) {
              Object.entries(data.errors).forEach(([field, messages]) => {
                const errorElement = document.getElementById(`${field}-error`);
                if (errorElement) {
                  errorElement.textContent = messages.join(', ');
                  errorElement.style.display = 'block';
                }
              });
            } else {
              throw new Error(data.error || 'Error al subir el anuncio');
            }
            return;
          }

          // Mostrar mensaje de éxito
          const successMessage = document.getElementById('ad-success-message');
          successMessage.classList.remove('d-none');

          setTimeout(() => {
            successMessage.classList.add('d-none');
          }, 5000);

          // Resetear formulario
          this.reset();
          this.classList.remove('was-validated');
        } catch (error) {
          console.error('Error:', error);
          alert('Error al subir el anuncio: ' + error.message);
        } finally {
          document.getElementById('ad-loading').classList.add('d-none');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

  initAddAd();
});
