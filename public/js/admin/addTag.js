async function initAddTag() {
  const backendAPI = '/api/';

  // Manejar envío del formulario
  document
    .getElementById('add-tag-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validación del formulario
      if (!this.checkValidity()) {
        this.classList.add('was-validated');
        return;
      }

      // Resetear mensajes de error
      document
        .querySelectorAll('#add-tag-form .invalid-feedback')
        .forEach((el) => (el.textContent = ''));
      document
        .getElementById('add-tag-success-message')
        .classList.add('d-none');

      // Mostrar loader
      document.getElementById('add-tag-loading').classList.remove('d-none');

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
          throw new Error(data.error || 'Error al añadir la etiqueta');
        }

        // Mostrar mensaje de éxito
        document
          .getElementById('add-tag-success-message')
          .classList.remove('d-none');
        setTimeout(() => {
          document
            .getElementById('add-tag-success-message')
            .classList.add('d-none');
        }, 5000);

        // Resetear formulario
        this.reset();
        this.classList.remove('was-validated');
      } catch (error) {
        console.error('Error:', error);
        // Mostrar error al usuario
        const errorElement = document.getElementById('add-tag-name-error');
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
      } finally {
        document.getElementById('add-tag-loading').classList.add('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  initAddTag();
});
