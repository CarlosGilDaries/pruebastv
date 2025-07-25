async function editGenderForm() {
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const id = localStorage.getItem('id');

  await loadGenderData(id);

  // Función para cargar datos del género
  async function loadGenderData(id) {
    try {
      const response = await fetch(`${backendAPI}gender/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos del género');
      }

      const data = await response.json();

      if (data.success && data.gender) {
        document.getElementById('edit-gender-name').value =
          data.gender.name || '';
      } else {
        throw new Error(data.message || 'Error al cargar el género');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert(
        'Error al cargar los datos del género: ' + error.message,
        'danger'
      );
    }
  }

  // Manejar el envío del formulario
  document
    .getElementById('edit-gender-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validar formulario
      if (!this.checkValidity()) {
        this.classList.add('was-validated');
        return;
      }

      document.getElementById('edit-gender-loading').classList.remove('d-none');
      document
        .getElementById('edit-gender-success-message')
        .classList.add('d-none');

      try {
        const formData = new FormData();
        formData.append(
          'name',
          document.getElementById('edit-gender-name').value
        );

        const response = await fetch(`${backendAPI}edit-gender/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          // Mostrar errores de validación del servidor
          if (data.errors) {
            for (const field in data.errors) {
              const errorElement = document.getElementById(
                `edit-gender-${field}-error`
              );
              if (errorElement) {
                errorElement.textContent = data.errors[field][0];
                errorElement.style.display = 'block';
              }
            }
          } else {
            throw new Error(data.message || 'Error al editar el género');
          }
          return;
        }

        // Mostrar mensaje de éxito
        document
          .getElementById('edit-gender-success-message')
          .classList.remove('d-none');
        setTimeout(() => {
          document
            .getElementById('edit-gender-success-message')
            .classList.add('d-none');
        }, 5000);
      } catch (error) {
        console.error('Error submitting form:', error);
        showAlert('Error al editar el género: ' + error.message, 'danger');
      } finally {
        document.getElementById('edit-gender-loading').classList.add('d-none');
      }
    });

  // Función auxiliar para mostrar alertas
  function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
    document.getElementById('edit-gender').prepend(alertDiv);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alertDiv);
      bsAlert.close();
    }, 5000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  editGenderForm();
});
