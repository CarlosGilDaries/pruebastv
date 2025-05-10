(function () {
  async function initAddPlan() {
    const backendAPI = 'https://pruebastv.kmc.es/api/';

    // Manejar envío del formulario
    document
      .getElementById('add-plan-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        // Resetear mensajes de error
        document
          .querySelectorAll('#add-plan-form .error-message')
          .forEach((el) => (el.textContent = ''));
        document.getElementById('add-plan-success-message').style.display = 'none';

        // Mostrar loader
        document.getElementById('add-plan-loading').style.display = 'block';

        // Obtener token de autenticación
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        // Crear FormData
        const formAdData = new FormData();
        formAdData.append('name', document.getElementById('add-plan-name').value);
        formAdData.append('price', document.getElementById('add-plan-price').value);
          formAdData.append('max_devices', document.getElementById('add-plan-max-devices').value);
          formAdData.append('max_streams', document.getElementById('add-plan-max-streams').value);
          formAdData.append('ads', document.getElementById('add-plan-ads').value);

        try {
          const response = await fetch(backendAPI + 'add-plan', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formAdData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error al subir el plan');
          }

          // Mostrar mensaje de éxito
          document.getElementById('add-plan-success-message').style.display = 'block';
          setTimeout(() => {
            document.getElementById('add-plan-success-message').style.display =
              'none';
          }, 5000);

          // Resetear formulario
          document.getElementById('add-plan-form').reset();
        } catch (error) {
          console.error('Error:', error);
        } finally {
          document.getElementById('add-plan-loading').style.display = 'none';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

  // Verificar si el DOM está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAddPlan);
  } else {
    initAddPlan();
  }
})();
