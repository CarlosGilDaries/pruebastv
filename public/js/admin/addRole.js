document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('auth_token');
  loadPermissions(token);

  // Manejar el envío del formulario
  document
    .getElementById('add-role-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      addRole(token);
    });
});

function loadPermissions(token) {
  const container = document.getElementById('permissions-container');
  const loadingSpinner = document.getElementById('loading-permissions');

  // Mostrar spinner de carga
  container.innerHTML = '';
  loadingSpinner.style.display = 'block';

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
          '<p class="error-message">No se pudieron cargar los permisos</p>';
      })
      .finally(() => {
        loadingSpinner.style.display = 'none';
      });
}

function renderPermissions(permissions) {
  const container = document.getElementById('permissions-container');

  if (permissions.length === 0) {
    container.innerHTML = '<p>No hay permisos disponibles</p>';
    return;
  }

  let html = '';
  permissions.forEach((permission) => {
    html += `
            <label class="checkbox-container">
                <input type="checkbox" 
                       id="permission-${permission.id}" 
                       name="permissions[]" 
                       value="${permission.id}">
                       <span class="checkmark"></span>
                <p>${permission.name}</p>
            </label>
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
  loading.style.display = 'flex';
  successMessage.style.display = 'none';

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
      successMessage.style.display = 'block';
      form.reset();

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 3000);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    })
    .finally(() => {
      loading.style.display = 'none';
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
