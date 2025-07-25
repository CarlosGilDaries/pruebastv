document.addEventListener('DOMContentLoaded', function () {
  async function initAddCategory() {
    const backendAPI = '/api/';
    const authToken = localStorage.getItem('auth_token');
    const select = document.getElementById('priority');

    try {
      const response = await fetch(backendAPI + 'categories', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      const priorities = data.priorities || [];

      // Llenar opciones de prioridad
      if (priorities.length > 0) {
        priorities.forEach((priority) => {
          const option = document.createElement('option');
          option.textContent = priority;
          option.value = priority;
          select.appendChild(option);
        });

        // Agregar última opción (n+1)
        const lastOption = document.createElement('option');
        lastOption.textContent = priorities.length + 1;
        lastOption.value = priorities.length + 1;
        select.appendChild(lastOption);
      } else {
        // Si no hay prioridades, agregar solo la opción 1
        const option = document.createElement('option');
        option.textContent = 1;
        option.value = 1;
        select.appendChild(option);
      }

      // Manejar envío del formulario
      document
        .getElementById('add-category-form')
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
            .querySelectorAll('#add-category-form .invalid-feedback')
            .forEach((el) => {
              el.textContent = '';
              el.style.display = 'none';
            });
          document
            .getElementById('add-category-success-message')
            .classList.add('d-none');

          // Mostrar loader
          document
            .getElementById('add-category-loading')
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
              document.getElementById('add-category-name').value
            );
            formData.append(
              'priority',
              document.getElementById('priority').value
            );
            formData.append(
              'render_at_index',
              document.getElementById('render').checked ? '1' : '0'
            );

            const response = await fetch(backendAPI + 'add-category', {
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
                throw new Error(data.error || 'Error al crear la categoría');
              }
              return;
            }

            // Mostrar mensaje de éxito
            const successMessage = document.getElementById(
              'add-category-success-message'
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
            alert('Error al crear la categoría: ' + error.message);
          } finally {
            document
              .getElementById('add-category-loading')
              .classList.add('d-none');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
    } catch (error) {
      console.error('Error inicializando formulario:', error);
      alert('Error al cargar los datos iniciales: ' + error.message);
    }
  }

  initAddCategory();
});
