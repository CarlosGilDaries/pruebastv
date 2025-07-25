async function editCategoryForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const select = document.getElementById('edit-category-priority');

  await loadCategoryData(id);

  async function loadCategoryData(id) {
    try {
      // Cargar prioridades disponibles
      const priorityResponse = await fetch(backendAPI + 'categories', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!priorityResponse.ok) {
        throw new Error('Error al cargar las prioridades');
      }

      const priorityData = await priorityResponse.json();
      const priorities = priorityData.priorities;

      // Limpiar y llenar select de prioridades
      select.innerHTML =
        '<option value="" disabled selected>Selecciona prioridad</option>';
      priorities.forEach((priority) => {
        const option = document.createElement('option');
        option.textContent = priority;
        option.value = priority;
        select.appendChild(option);
      });

      // Cargar datos de la categoría
      const response = await fetch(`${backendAPI}category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos de la categoría');
      }

      const data = await response.json();

      if (data.success && data.category) {
        document.getElementById('edit-category-name').value =
          data.category.name || '';
        document.getElementById('edit-category-priority').value =
          data.category.priority || '';
        document.getElementById('edit-category-render').checked =
          data.category.render_at_index === 1;
      } else {
        throw new Error(data.message || 'Error al cargar la categoría');
      }
    } catch (error) {
      console.error('Error:', error);
      // Mostrar error al usuario
      const errorElement = document.createElement('div');
      errorElement.className = 'alert alert-danger mt-3';
      errorElement.textContent = error.message;
      document.getElementById('edit-category-form').prepend(errorElement);
      setTimeout(() => errorElement.remove(), 5000);
    }
  }

  // Manejar el envío del formulario
  document
    .getElementById('edit-category-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validar formulario
      if (!this.checkValidity()) {
        this.classList.add('was-validated');
        return;
      }

      const id = localStorage.getItem('id');
      document
        .getElementById('edit-category-loading')
        .classList.remove('d-none');
      document
        .getElementById('edit-category-success-message')
        .classList.add('d-none');

      try {
        const formData = new FormData();
        formData.append(
          'name',
          document.getElementById('edit-category-name').value
        );
        formData.append(
          'priority',
          document.getElementById('edit-category-priority').value
        );
        formData.append(
          'render_at_index',
          document.getElementById('edit-category-render').checked ? '1' : '0'
        );

        const response = await fetch(`${backendAPI}edit-category/${id}`, {
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
                `edit-category-${field}-error`
              );
              if (errorElement) {
                errorElement.textContent = data.errors[field][0];
                errorElement.style.display = 'block';
              }
            }
          } else {
            throw new Error(data.message || 'Error al editar la categoría');
          }
          return;
        }

        // Mostrar mensaje de éxito
        document
          .getElementById('edit-category-success-message')
          .classList.remove('d-none');
        setTimeout(() => {
          document
            .getElementById('edit-category-success-message')
            .classList.add('d-none');
        }, 5000);
      } catch (error) {
        console.error('Error submitting form:', error);
        // Mostrar error al usuario
        const errorElement = document.createElement('div');
        errorElement.className = 'alert alert-danger mt-3';
        errorElement.textContent = error.message;
        this.prepend(errorElement);
        setTimeout(() => errorElement.remove(), 5000);
      } finally {
        document
          .getElementById('edit-category-loading')
          .classList.add('d-none');
      }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  editCategoryForm();
});
