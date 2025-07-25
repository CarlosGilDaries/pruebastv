document.addEventListener('DOMContentLoaded', function () {
  async function initAddGender() {
    const backendAPI = '/api/';
    const authToken = localStorage.getItem('auth_token');

    // Manejar envío del formulario
    document
      .getElementById('add-gender-form')
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
          .querySelectorAll('#add-gender-form .invalid-feedback')
          .forEach((el) => {
            el.textContent = '';
            el.style.display = 'none';
          });
        document
          .getElementById('add-gender-success-message')
          .classList.add('d-none');

        // Mostrar loader
        document
          .getElementById('add-gender-loading')
          .classList.remove('d-none');

        // Verificar autenticación
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        try {
          const formData = new FormData();
          formData.append(
            'name',
            document.getElementById('add-gender-name').value
          );

          const response = await fetch(backendAPI + 'add-gender', {
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
              throw new Error(data.error || 'Error al añadir el género');
            }
            return;
          }

          // Mostrar mensaje de éxito
          const successMessage = document.getElementById(
            'add-gender-success-message'
          );
          successMessage.classList.remove('d-none');

          setTimeout(() => {
            successMessage.classList.add('d-none');
          }, 5000);

          // Resetear formulario
          this.reset();
          this.classList.remove('was-validated');
        } catch (error) {
          console.error('Error:', error);
          alert('Error al añadir el género: ' + error.message);
        } finally {
          document.getElementById('add-gender-loading').classList.add('d-none');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

  initAddGender();
});
