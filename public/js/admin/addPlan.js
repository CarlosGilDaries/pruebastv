document.addEventListener('DOMContentLoaded', function () {
  async function initAddPlan() {
    const backendAPI = '/api/';
    const authToken = localStorage.getItem('auth_token');

    // Manejar envío del formulario
    document
      .getElementById('add-plan-form')
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
          .querySelectorAll('#add-plan-form .invalid-feedback')
          .forEach((el) => {
            el.textContent = '';
            el.style.display = 'none';
          });
        document
          .getElementById('add-plan-success-message')
          .classList.add('d-none');

        // Mostrar loader
        document.getElementById('add-plan-loading').classList.remove('d-none');

        // Verificar autenticación
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        try {
          const formData = new FormData();
          formData.append(
            'name',
            document.getElementById('add-plan-name').value
          );
          formData.append(
            'trimestral_price',
            document.getElementById('add-plan-trimestral-price').value
          );
          formData.append(
            'anual_price',
            document.getElementById('add-plan-anual-price').value
          );
          formData.append(
            'max_devices',
            document.getElementById('add-plan-max-devices').value
          );
          formData.append(
            'max_streams',
            document.getElementById('add-plan-max-streams').value
          );
          formData.append('ads', document.getElementById('add-plan-ads').value);

          const response = await fetch(backendAPI + 'add-plan', {
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
              throw new Error(data.error || 'Error al crear el plan');
            }
            return;
          }

          // Mostrar mensaje de éxito
          const successMessage = document.getElementById(
            'add-plan-success-message'
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
          alert('Error al crear el plan: ' + error.message);
        } finally {
          document.getElementById('add-plan-loading').classList.add('d-none');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

  initAddPlan();
});
