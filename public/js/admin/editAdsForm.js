async function editAdsForm() {
  let id;
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';

  // Obtener ID del anuncio
  id = localStorage.getItem('id');
  await loadAdData(id);

  // Escuchar cuando se muestra el formulario (si es un modal)
  document
    .getElementById('edit-ad')
    ?.addEventListener('show', async function () {
      id = localStorage.getItem('id');
      await loadAdData(id);
    });

  // Manejar envío del formulario
  document
    .getElementById('edit-ad-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validar formulario
      if (!this.checkValidity()) {
        this.classList.add('was-validated');
        return;
      }

      // Mostrar loading
      document.getElementById('edit-ad-loading').classList.remove('d-none');
      document
        .getElementById('edit-ad-success-message')
        .classList.add('d-none');

      // Preparar datos del formulario
      const formData = new FormData();
      formData.append('title', document.getElementById('edit-ad-title').value);
      formData.append('brand', document.getElementById('edit-ad-brand').value);

      try {
        const editResponse = await fetch(backendAPI + `update-ad/${id}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await editResponse.json();

        if (data.success) {
          // Mostrar mensaje de éxito
          document
            .getElementById('edit-ad-success-message')
            .classList.remove('d-none');

          // Ocultar mensaje después de 5 segundos
          setTimeout(() => {
            document
              .getElementById('edit-ad-success-message')
              .classList.add('d-none');
          }, 5000);

          // Scroll al inicio
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Mostrar errores si existen
          if (data.errors) {
            for (const field in data.errors) {
              const errorElement = document.getElementById(
                `edit-ad-${field}-error`
              );
              if (errorElement) {
                errorElement.textContent = data.errors[field][0];
                errorElement.style.display = 'block';
              }
            }
          } else {
            throw new Error(data.message || 'Error al editar el anuncio');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        // Mostrar error general
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger mt-3';
        errorAlert.textContent = error.message;
        this.appendChild(errorAlert);
        setTimeout(() => errorAlert.remove(), 5000);
      } finally {
        document.getElementById('edit-ad-loading').classList.add('d-none');
      }
    });

  // Función para cargar datos del anuncio
  async function loadAdData(id) {
    try {
      const response = await fetch(backendAPI + `edit-view-ad/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const ad = data.data;
        document.getElementById('edit-ad-title').value = ad.title || '';
        document.getElementById('edit-ad-brand').value = ad.brand || '';
      } else {
        throw new Error(
          data.message || 'Error al cargar los datos del anuncio'
        );
      }
    } catch (error) {
      console.error('Error cargando anuncio:', error);
      // Mostrar error al usuario
      const errorElement = document.getElementById('edit-ad-title-error');
      if (errorElement) {
        errorElement.textContent = 'Error al cargar los datos del anuncio';
        errorElement.style.display = 'block';
      }
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  editAdsForm();
});
