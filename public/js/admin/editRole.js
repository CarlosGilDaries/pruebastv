document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('auth_token');
  const roleId = localStorage.getItem('id');

  if (roleId) {
    loadRoleData(roleId, token);
  } else {
    console.error('No se proporcionó ID de rol');
  }

  // Manejar el envío del formulario
  document
    .getElementById('edit-role-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      updateRole(roleId, token);
    });
});

function loadRoleData(roleId, token) {
  const loading = document.getElementById('edit-role-loading');
  loading.style.display = 'flex';

  // Cargar datos del rol y permisos
  Promise.all([
    fetch(`/api/role/${roleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    fetch('/api/permissions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ])
    .then((responses) => Promise.all(responses.map((res) => res.json())))
    .then(([roleData, permissionsData]) => {
      if (!roleData.success || !permissionsData.success) {
        throw new Error('Error al cargar datos');
      }

      // Rellenar nombre del rol
      document.getElementById('edit-role-name').value = roleData.role.name;

      // Renderizar permisos con los seleccionados marcados
      const selectedPermissionIds = roleData.role.permissions.map((p) => p.id);
      renderPermissions(permissionsData.permissions, selectedPermissionIds);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Error al cargar datos del rol: ' + error.message);
    })
    .finally(() => {
      loading.style.display = 'none';
    });
}

function renderPermissions(permissions, selectedPermissionIds = []) {
  const container = document.getElementById('permissions-container');
  const loadingSpinner = document.getElementById('loading-permissions');

  if (permissions.length === 0) {
    container.innerHTML = '<p>No hay permisos disponibles</p>';
    return;
  }

  let html = '';
  permissions.forEach((permission) => {
    const isChecked = selectedPermissionIds.includes(permission.id);
    html += `
            <label class="checkbox-container">
                <input type="checkbox" 
                       id="permission-${permission.id}" 
                       name="permissions[]" 
                       value="${permission.id}"
                       ${isChecked ? 'checked' : ''}>
                <span class="checkmark"></span>
                <p>${permission.name}</p>
            </label>
        `;
  });

  container.innerHTML = html;
  loadingSpinner.style.display = 'none';
}

function updateRole(roleId, token) {
  const form = document.getElementById('edit-role-form');
  const loading = document.getElementById('edit-role-loading');
  const successMessage = document.getElementById('edit-role-success-message');
  const name = document.getElementById('edit-role-name').value;

  // Obtener permisos seleccionados
  const checkboxes = document.querySelectorAll(
    'input[name="permissions[]"]:checked'
  );
  const permissionIds = Array.from(checkboxes).map((cb) => cb.value);

  // Mostrar loading
  loading.style.display = 'flex';
  successMessage.style.display = 'none';

  // Primero actualizar el nombre del rol
  fetch(`/api/edit-role/${roleId}`, {
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
        // Si se actualizó el rol, actualizar permisos
        return assignPermissions(roleId, permissionIds, token);
      } else {
        throw new Error(data.message || 'Error al actualizar el rol');
      }
    })
    .then(() => {
      // Mostrar mensaje de éxito
      successMessage.style.display = 'block';

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
