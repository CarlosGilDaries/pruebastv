document.addEventListener('DOMContentLoaded', function () {
  async function initAddLegalNotice() {
    const backendAPI = '/api/';
    const authToken = localStorage.getItem('auth_token');

    // Manejar envío del formulario
    document
      .getElementById('add-legal-notice-form')
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
          .querySelectorAll('#add-legal-notice-form .invalid-feedback')
          .forEach((el) => {
            el.textContent = '';
            el.style.display = 'none';
          });
        document
          .getElementById('add-legal-notice-success-message')
          .classList.add('d-none');

        // Mostrar loader
        document
          .getElementById('add-legal-notice-loading')
          .classList.remove('d-none');

        // Verificar autenticación
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        try {
          const formData = new FormData();
          formData.append(
            'title',
            document.getElementById('add-legal-notice-title').value
          );
          formData.append('text', CKEDITOR.instances.text.getData());

          const response = await fetch(backendAPI + 'add-legal-notice', {
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
              throw new Error(data.error || 'Error al guardar el aviso legal');
            }
            return;
          }

          // Mostrar mensaje de éxito
          const successMessage = document.getElementById(
            'add-legal-notice-success-message'
          );
          successMessage.classList.remove('d-none');

          setTimeout(() => {
            successMessage.classList.add('d-none');
          }, 5000);

          // Resetear formulario
          this.reset();
          CKEDITOR.instances.text.setData('');
          this.classList.remove('was-validated');
        } catch (error) {
          console.error('Error:', error);
          alert('Error al guardar el aviso legal: ' + error.message);
        } finally {
          document
            .getElementById('add-legal-notice-loading')
            .classList.add('d-none');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

  initAddLegalNotice();
});
