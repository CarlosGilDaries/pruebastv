async function initAddLegalNotice() {
    const backendAPI = '/api/';

    // Manejar envío del formulario
    document
      .getElementById('add-legal-notice-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        // Resetear mensajes de error
        document
          .querySelectorAll('#add-legal-notice-form .error-message')
          .forEach((el) => (el.textContent = ''));
        document.getElementById('add-legal-notice-success-message').style.display = 'none';

        // Mostrar loader
        document.getElementById('add-legal-notice-loading').style.display = 'block';

        // Obtener token de autenticación
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        // Crear FormData
        const formAdData = new FormData();
        formAdData.append('title', document.getElementById('add-legal-notice-title').value);
        formAdData.append('text', CKEDITOR.instances.text.getData());

        try {
          const response = await fetch(backendAPI + 'add-legal-notice', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formAdData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error al subir la etiqueta');
          }

          // Mostrar mensaje de éxito
          document.getElementById('add-legal-notice-success-message').style.display = 'block';
          setTimeout(() => {
            document.getElementById('add-legal-notice-success-message').style.display =
              'none';
          }, 5000);

          // Resetear formulario
          document.getElementById('add-legal-notice-form').reset();
          CKEDITOR.instances.text.setData('');
        } catch (error) {
          console.error('Error:', error);
        } finally {
          document.getElementById('add-legal-notice-loading').style.display = 'none';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

initAddLegalNotice();
