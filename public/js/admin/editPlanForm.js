async function editPlanForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const select = document.getElementById('plan_order');

  await loadPlanData(id);

  // Escuchar cuando se muestra el formulario (si es un modal)
  document
    .getElementById('edit-plan')
    ?.addEventListener('show', async function () {
      const id = localStorage.getItem('id');
      await loadPlanData(id);
    });

  async function loadPlanData(id) {
    try {
      // Cargar prioridades disponibles
      const orderResponse = await fetch(backendAPI + 'plans', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!orderResponse.ok) {
        throw new Error('Error al cargar las prioridades');
      }

      const orderData = await orderResponse.json();
      const orders = orderData.orders;

      // Limpiar y llenar select de prioridades
      select.innerHTML =
        '<option value="" disabled selected>Selecciona orden</option>';
      orders.forEach((order) => {
        const option = document.createElement('option');
        option.textContent = order;
        option.value = order;
        select.appendChild(option);
      });

      const response = await fetch(backendAPI + `plan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos del plan');
      }

      const data = await response.json();
      const plan = data.plan;

      if (!plan) {
        throw new Error('No se encontraron datos del plan');
      }

      // Llenar formulario con datos del plan
      document.getElementById('edit-plan-name').value = plan.name || '';
      document.getElementById('plan_order').value =
        plan.plan_order || '';
      document.getElementById('edit-plan-trimestral-price').value =
        plan.trimestral_price || '';
      document.getElementById('edit-plan-anual-price').value =
        plan.anual_price || '';
      document.getElementById('edit-plan-max-devices').value =
        plan.max_devices || '';
      document.getElementById('edit-plan-max-streams').value =
        plan.max_streams || '';
      document.getElementById('edit-plan-ads').value = plan.ads || '0';
    } catch (error) {
      console.error('Error cargando plan:', error);
      showAlert(
        'Error al cargar los datos del plan: ' + error.message,
        'danger'
      );
    }
  }

  // Manejar envío del formulario
  document
    .getElementById('edit-plan-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validar formulario
      if (!this.checkValidity()) {
        this.classList.add('was-validated');
        return;
      }

      document.getElementById('edit-plan-loading').classList.remove('d-none');
      document
        .getElementById('edit-plan-success-message')
        .classList.add('d-none');

      try {
        const formData = new FormData();
        formData.append(
          'name',
          document.getElementById('edit-plan-name').value
        );
        formData.append(
          'plan_order',
          document.getElementById('plan_order').value
        );
        formData.append(
          'trimestral_price',
          document.getElementById('edit-plan-trimestral-price').value
        );
        formData.append(
          'anual_price',
          document.getElementById('edit-plan-anual-price').value
        );
        formData.append(
          'max_devices',
          document.getElementById('edit-plan-max-devices').value
        );
        formData.append(
          'max_streams',
          document.getElementById('edit-plan-max-streams').value
        );
        formData.append('ads', document.getElementById('edit-plan-ads').value);

        const response = await fetch(backendAPI + `edit-plan/${id}`, {
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
                `edit-plan-${field}-error`
              );
              if (errorElement) {
                errorElement.textContent = data.errors[field][0];
                errorElement.style.display = 'block';
              }
            }
          } else {
            throw new Error(data.message || 'Error al editar el plan');
          }
          return;
        }

        // Mostrar mensaje de éxito
        document
          .getElementById('edit-plan-success-message')
          .classList.remove('d-none');
        setTimeout(() => {
          document
            .getElementById('edit-plan-success-message')
            .classList.add('d-none');
        }, 5000);

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error('Error:', error);
        showAlert('Error al editar el plan: ' + error.message, 'danger');
      } finally {
        document.getElementById('edit-plan-loading').classList.add('d-none');
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
    document.getElementById('edit-plan').prepend(alertDiv);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alertDiv);
      bsAlert.close();
    }, 5000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  editPlanForm();
});
