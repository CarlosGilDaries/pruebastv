async function initAddTag() {
    const backendAPI = '/api/';

    // Manejar envío del formulario
    document
      .getElementById('add-tag-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        // Resetear mensajes de error
        document
          .querySelectorAll('#add-tag-form .error-message')
          .forEach((el) => (el.textContent = ''));
        document.getElementById('add-tag-success-message').style.display = 'none';

        // Mostrar loader
        document.getElementById('add-tag-loading').style.display = 'block';

        // Obtener token de autenticación
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        // Crear FormData
        const formAdData = new FormData();
        formAdData.append('name', document.getElementById('add-tag-name').value);

        try {
          const response = await fetch(backendAPI + 'add-tag', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formAdData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error al subir el género');
          }

          // Mostrar mensaje de éxito
          document.getElementById('add-tag-success-message').style.display = 'block';
          setTimeout(() => {
            document.getElementById('add-tag-success-message').style.display =
              'none';
          }, 5000);

          // Resetear formulario
          document.getElementById('add-tag-form').reset();
        } catch (error) {
          console.error('Error:', error);
        } finally {
          document.getElementById('add-tag-loading').style.display = 'none';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

initAddTag();
