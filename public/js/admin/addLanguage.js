document.addEventListener('DOMContentLoaded', function () {
  async function initAddLanguage() {
    const backendAPI = '/api/';
    const authToken = localStorage.getItem('auth_token');

    try {
      // Manejar envío del formulario
      document
        .getElementById('add-language-form')
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
            .querySelectorAll('#add-language-form .invalid-feedback')
            .forEach((el) => {
              el.textContent = '';
              el.style.display = 'none';
            });
          document
            .getElementById('add-language-success-message')
            .classList.add('d-none');

          // Mostrar loader
          document
            .getElementById('add-language-loading')
            .classList.remove('d-none');

          // Verificar autenticación
          if (!authToken) {
            window.location.href = '/login';
            return;
          }

          try {
            const formData = {
              name: document.getElementById('add-language-name').value,
              code: document.getElementById('add-language-code').value,
              is_active: document.getElementById('is_active').checked ? 1 : 0,
              translations: {
                login: document.getElementById('translation_login').value,
                forgot_password: document.getElementById(
                  'translation_forgot_password'
                ).value,
                login_button: document.getElementById(
                  'translation_login_button'
                ).value,
                no_account: document.getElementById('translation_no_account')
                  .value,
                register: document.getElementById('translation_register').value,
                legal_notice: document.getElementById(
                  'translation_legal_notice'
                ).value,
                privacy_policy: document.getElementById(
                  'translation_privacy_policy'
                ).value,
                contact: document.getElementById('translation_contact').value,
              },
            };

            const response = await fetch(backendAPI + 'add-language', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
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
                throw new Error(data.error || 'Error al crear la idioma');
              }
              return;
            }

            // Mostrar mensaje de éxito
            const successMessage = document.getElementById(
              'add-language-success-message'
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
            alert('Error al crear la idioma: ' + error.message);
          } finally {
            document
              .getElementById('add-language-loading')
              .classList.add('d-none');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
    } catch (error) {
      console.error('Error inicializando formulario:', error);
      alert('Error al cargar los datos iniciales: ' + error.message);
    }
  }

  initAddLanguage();
});
