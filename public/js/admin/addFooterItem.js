async function initAddFooterItem() {
  const backendAPI = '/api/';
  const authToken = localStorage.getItem('auth_token');

  try {
    // Mostrar nombre de archivos seleccionados
    const setupFileInput = (inputId, nameId, labelId) => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('change', function (e) {
          const fileName =
            e.target.files[0]?.name || 'Ningún archivo seleccionado';
          if (nameId) document.getElementById(nameId).textContent = fileName;
          if (labelId) document.getElementById(labelId).textContent = fileName;
        });
      }
    };

    setupFileInput('logo_input', 'logo_input-name', 'logo_input-label-text');

    // Manejar envío del formulario
    document
      .getElementById('add-footer-item-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        // Resetear mensajes de error
        document
          .querySelectorAll('#add-footer-item-form .error-message')
          .forEach((el) => (el.textContent = ''));
        document.getElementById('success-message').style.display = 'none';

        // Mostrar loader
        document.getElementById('loading').style.display = 'block';

        // Obtener token de autenticación
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        // Crear FormData
        const formAdData = new FormData();
        formAdData.append('name', document.getElementById('name').value);
        formAdData.append('url', document.getElementById('url').value);
        if (document.getElementById('logo_input')) {
          formAdData.append('logo', document.getElementById('logo_input').files[0]);
        }

        try {
          const response = await fetch(backendAPI + 'add-footer-item', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formAdData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error al subir la acción');
          }

          // Mostrar mensaje de éxito
          document.getElementById('success-message').style.display = 'block';
          setTimeout(() => {
            document.getElementById('success-message').style.display = 'none';
          }, 5000);

          // Resetear formulario
          document.getElementById('add-footer-item-form').reset();
        } catch (error) {
          console.error('Error:', error);
        } finally {
          document.getElementById('loading').style.display = 'none';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  } catch (error) {
    console.log(error);
  }
}

initAddFooterItem();
