document.addEventListener('DOMContentLoaded', function () {
  async function initAddFooterItem() {
    const backendAPI = '/api/';
    const authToken = localStorage.getItem('auth_token');

    try {
      // Manejar envío del formulario
      document
        .getElementById('add-footer-item-form')
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
            .querySelectorAll('#add-footer-item-form .invalid-feedback')
            .forEach((el) => {
              el.textContent = '';
              el.style.display = 'none';
            });
          document.getElementById('success-message').classList.add('d-none');

          // Mostrar loader
          document.getElementById('loading').classList.remove('d-none');

          // Verificar autenticación
          if (!authToken) {
            window.location.href = '/login';
            return;
          }

          try {
            const formData = new FormData();
            formData.append('name', document.getElementById('name').value);
            formData.append('url', document.getElementById('url').value);

            const logoInput = document.getElementById('logo_input');
            if (logoInput.files.length > 0) {
              formData.append('logo', logoInput.files[0]);
            }

            const response = await fetch(backendAPI + 'add-footer-item', {
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
                  const errorElement = document.getElementById(
                    `${field}-error`
                  );
                  if (errorElement) {
                    errorElement.textContent = messages.join(', ');
                    errorElement.style.display = 'block';
                  }
                });
              } else {
                throw new Error(data.error || 'Error al añadir el item');
              }
              return;
            }

            // Mostrar mensaje de éxito
            const successMessage = document.getElementById('success-message');
            successMessage.classList.remove('d-none');

            setTimeout(() => {
              successMessage.classList.add('d-none');
            }, 5000);

            // Resetear formulario
            this.reset();
            this.classList.remove('was-validated');
          } catch (error) {
            console.error('Error:', error);
            alert('Error al añadir el item: ' + error.message);
          } finally {
            document.getElementById('loading').classList.add('d-none');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
    } catch (error) {
      console.error('Error inicializando formulario:', error);
      alert('Error al inicializar el formulario: ' + error.message);
    }
  }

  initAddFooterItem();
});
