document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('auth_token');
    const roleId = localStorage.getItem('id');
    const form = document.getElementById('edit-role-form');

    if (!roleId) {
        showError('No se proporcionó ID de rol');
        return;
    }

    // Cargar datos del rol
    loadRoleData(roleId, token);

    // Manejar el envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        
        updateRole(roleId, token);
    });

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.textContent = message;
        form.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    function loadRoleData(roleId, token) {
        const loadingPermissions = document.getElementById('permissions-loading');
        const loadingRole = document.getElementById('edit-role-loading');
        
        loadingPermissions.classList.remove('d-none');
        loadingRole.classList.remove('d-none');

        Promise.all([
            fetch(`/api/role/${roleId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch('/api/permissions', {
                headers: { Authorization: `Bearer ${token}` }
            })
        ])
        .then(responses => Promise.all(responses.map(res => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        }))
        .then(([roleData, permissionsData]) => {
            if (!roleData.success || !permissionsData.success) {
                throw new Error('Error al cargar datos');
            }

            document.getElementById('edit-role-name').value = roleData.role.name;
            renderPermissions(permissionsData.permissions, roleData.role.permissions.map(p => p.id));
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Error al cargar datos del rol: ' + error.message);
        })
        .finally(() => {
            loadingPermissions.classList.add('d-none');
            loadingRole.classList.add('d-none');
        }));
    }

    function renderPermissions(permissions, selectedPermissionIds = []) {
        const container = document.getElementById('permissions-container');
        
        if (permissions.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-muted">No hay permisos disponibles</p></div>';
            return;
        }

        let html = '';
        permissions.forEach(permission => {
            const isChecked = selectedPermissionIds.includes(permission.id);
            html += `
                <div class="col">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" 
                               id="permission-${permission.id}" 
                               name="permissions[]" 
                               value="${permission.id}"
                               ${isChecked ? 'checked' : ''}>
                        <label class="form-check-label" for="permission-${permission.id}">
                            ${permission.name}
                        </label>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    function updateRole(roleId, token) {
        const loading = document.getElementById('edit-role-loading');
        const successMessage = document.getElementById('edit-role-success-message');
        const name = document.getElementById('edit-role-name').value;
        const checkboxes = document.querySelectorAll('input[name="permissions[]"]:checked');
        const permissionIds = Array.from(checkboxes).map(cb => cb.value);

        loading.classList.remove('d-none');
        successMessage.classList.add('d-none');

        fetch(`/api/edit-role/${roleId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: name })
        })
        .then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Error al actualizar el rol');
            }
            return assignPermissions(roleId, permissionIds, token);
        })
        .then(() => {
            successMessage.classList.remove('d-none');
            setTimeout(() => successMessage.classList.add('d-none'), 3000);
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Error: ' + error.message);
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
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ permission_ids: permissionIds })
        })
        .then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Error al asignar permisos');
            }
            return data;
        });
    }
});