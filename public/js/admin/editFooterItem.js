async function editFooterItemForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';

  await loadFooterItemData(id);

  async function loadFooterItemData(id) {
    try {
      const response = await fetch(`${backendAPI}footer-item/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos del item');
      }

      const data = await response.json();

      if (data.success) {
        // Configurar inputs de archivo para mostrar nombre
        const setupFileInput = (inputId, nameId, currentPath = null) => {
          const input = document.getElementById(inputId);
          const nameElement = document.getElementById(nameId);

          if (currentPath) {
            const fileName = currentPath.split('/').pop();
            if (nameElement)
              nameElement.textContent = `Archivo actual: ${fileName}`;
          }

          if (input) {
            input.addEventListener('change', function (e) {
              const fileName =
                e.target.files && e.target.files.length > 0
                  ? `Nuevo archivo: ${e.target.files[0].name}`
                  : 'Ningún archivo seleccionado';

              if (nameElement) nameElement.textContent = fileName;
            });
          }
        };

        setupFileInput('logo_input', 'logo_input-name', data.footerItem.logo);

        document.getElementById('name').value = data.footerItem.name || '';
        document.getElementById('url').value = data.footerItem.url || '';
      } else {
        throw new Error(data.message || 'Error al cargar el item');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert(
        'Error al cargar los datos del item: ' + error.message,
        'danger'
      );
    }
  }

  // Manejar el envío del formulario
  document
    .getElementById('edit-footer_item-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validar formulario
      if (!this.checkValidity()) {
        this.classList.add('was-validated');
        return;
      }

      document.getElementById('loading').classList.remove('d-none');
      document.getElementById('success-message').classList.add('d-none');

      try {
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('url', document.getElementById('url').value);

        const logoInput = document.getElementById('logo_input');
        if (logoInput.files.length > 0) {
          formData.append('logo', logoInput.files[0]);
        }

        const response = await fetch(`${backendAPI}edit-footer-item/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          // Mostrar errores de validación del servidor
          if (data.errors) {
            for (const field in data.errors) {
              const errorElement = document.getElementById(`${field}-error`);
              if (errorElement) {
                errorElement.textContent = data.errors[field][0];
                errorElement.style.display = 'block';
              }
            }
          } else {
            throw new Error(data.message || 'Error al editar el item');
          }
          return;
        }

        // Mostrar mensaje de éxito
        document.getElementById('success-message').classList.remove('d-none');
        setTimeout(() => {
          document.getElementById('success-message').classList.add('d-none');
        }, 5000);
      } catch (error) {
        console.error('Error submitting form:', error);
        showAlert('Error al editar el item: ' + error.message, 'danger');
      } finally {
        document.getElementById('loading').classList.add('d-none');
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
    document.getElementById('edit-footer-item-form').prepend(alertDiv);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alertDiv);
      bsAlert.close();
    }, 5000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  editFooterItemForm();
});
