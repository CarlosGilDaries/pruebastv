document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('auth_token');
  loadPermissions(token);

  // Manejar el envío del formulario
  document
    .getElementById('add-role-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      if (this.checkValidity()) {
        addRole(token);
      }
      this.classList.add('was-validated');
    });
});

function loadPermissions(token) {
  const container = document.getElementById('permissions-container');
  const loadingSpinner = document.getElementById('loading-permissions');

  // Mostrar spinner de carga
  container.innerHTML = '';
  loadingSpinner.classList.remove('d-none');

  // Hacer petición para obtener permisos
  fetch('/api/permissions', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        renderPermissions(data.permissions);
      } else {
        throw new Error('Error al cargar permisos');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      container.innerHTML =
        '<div class="alert alert-danger">No se pudieron cargar los permisos</div>';
    })
    .finally(() => {
      loadingSpinner.classList.add('d-none');
    });
}

function renderPermissions(permissions) {
  const container = document.getElementById('permissions-container');

  if (permissions.length === 0) {
    container.innerHTML =
      '<p class="text-muted">No hay permisos disponibles</p>';
    return;
  }

  let html = '';
  permissions.forEach((permission) => {
    html += `
            <div class="form-check">
                <input class="form-check-input" 
                       type="checkbox" 
                       id="permission-${permission.id}" 
                       name="permissions[]" 
                       value="${permission.id}">
                <label class="form-check-label" for="permission-${permission.id}">
                    ${permission.name}
                </label>
            </div>
        `;
  });

  container.innerHTML = html;
}

function addRole(token) {
  const form = document.getElementById('add-role-form');
  const loading = document.getElementById('add-role-loading');
  const successMessage = document.getElementById('add-role-success-message');
  const name = document.getElementById('add-role-name').value;

  // Obtener permisos seleccionados
  const checkboxes = document.querySelectorAll(
    'input[name="permissions[]"]:checked'
  );
  const permissionIds = Array.from(checkboxes).map((cb) => cb.value);

  // Mostrar loading
  loading.classList.remove('d-none');
  successMessage.classList.add('d-none');

  // Enviar datos del rol
  fetch('/api/add-role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: name,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Si se creó el rol, asignar permisos
        return assignPermissions(data.role.id, permissionIds, token);
      } else {
        throw new Error(data.message || 'Error al crear el rol');
      }
    })
    .then(() => {
      // Mostrar mensaje de éxito
      successMessage.classList.remove('d-none');
      form.reset();
      form.classList.remove('was-validated');

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        successMessage.classList.add('d-none');
      }, 3000);
    })
    .catch((error) => {
      console.error('Error:', error);
      // Mostrar error en un alert de Bootstrap (necesitarías implementar esto)
      showBootstrapAlert('Error: ' + error.message, 'danger');
    })
    .finally(() => {
      loading.classList.add('d-none');
    });
}

function assignPermissions(roleId, permissionIds, token) {
  return fetch(`/api/role/${roleId}/permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      permission_ids: permissionIds,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        throw new Error(data.message || 'Error al asignar permisos');
      }
      return data;
    });
}

// Función opcional para mostrar alertas de Bootstrap
function showBootstrapAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

  const container = document.getElementById('add-role');
  container.prepend(alertDiv);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    const bsAlert = new bootstrap.Alert(alertDiv);
    bsAlert.close();
  }, 5000);
}
