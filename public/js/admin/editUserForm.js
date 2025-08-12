document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const id = localStorage.getItem('id');
  const form = document.getElementById('edit-user-form');

  if (!id) {
    showError('No se proporcionó ID de usuario');
    return;
  }

  // Cargar datos del usuario
  loadUserData(id);

  // Manejar el envío del formulario
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await submitUserForm();
  });

  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    form.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  function validateForm() {
    let isValid = true;
    form.classList.add('was-validated');

    // Validar contraseñas si se ingresó alguna
    const password = document.getElementById('edit-user-password').value;
    const passwordConfirm = document.getElementById(
      'edit-user-password-confirmation'
    ).value;

    if (password || passwordConfirm) {
      if (password.length < 6) {
        document.getElementById('edit-user-password-error').style.display =
          'block';
        isValid = false;
      } else {
        document.getElementById('edit-user-password-error').style.display =
          'none';
      }

      if (password !== passwordConfirm) {
        document.getElementById(
          'edit-user-password-confirmation-error'
        ).style.display = 'block';
        isValid = false;
      } else {
        document.getElementById(
          'edit-user-password-confirmation-error'
        ).style.display = 'none';
      }
    }

    return isValid;
  }

  async function loadUserData(id) {
    const loading = document.getElementById('edit-user-loading');
    loading.classList.remove('d-none');

    try {
      const [userResponse, rolesResponse] = await Promise.all([
        fetch(`${backendAPI}user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/roles', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!userResponse.ok || !rolesResponse.ok) {
        throw new Error('Error al cargar los datos');
      }

      const userData = await userResponse.json();
      const rolesData = await rolesResponse.json();

      if (!userData.success || !rolesData.success) {
        throw new Error(
          userData.message ||
            rolesData.message ||
            'Error en los datos recibidos'
        );
      }

      const user = userData.data.user;
      const roles = rolesData.roles;

      // Llenar campos del formulario
      document.getElementById('edit-user-name').value = user.name || '';
      document.getElementById('edit-user-surnames').value = user.surnames || '';
      document.getElementById('edit-user-email').value = user.email || '';
      document.getElementById('edit-user-dni').value = user.dni || '';
      document.getElementById('edit-user-address').value = user.address || '';
      document.getElementById('edit-user-city').value = user.city || '';
      document.getElementById('edit-user-country').value = user.country || '';
      document.getElementById('edit-user-birth-year').value =
        user.birth_year || '';
      document.getElementById('edit-user-gender').value = user.gender || '';
      document.getElementById('edit-user-phone').value = user.phone || '';
      document.getElementById('country-code').value = user.phone_code || '';

      // Llenar select de roles
      const roleSelect = document.getElementById('edit-user-role');
      roles.forEach((role) => {
        const option = new Option(role.name, role.id);
        if (user.role?.id === role.id) {
          option.selected = true;
        }
        roleSelect.add(option);
      });
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      showError(error.message);
    } finally {
      loading.classList.add('d-none');
    }
  }

  async function submitUserForm() {
    const loading = document.getElementById('edit-user-loading');
    const successMessage = document.getElementById('edit-user-success-message');

    loading.classList.remove('d-none');
    successMessage.classList.add('d-none');

    try {
      const formData = new FormData();
      formData.append('name', document.getElementById('edit-user-name').value);
      formData.append(
        'surnames',
        document.getElementById('edit-user-surnames').value
      );
      formData.append(
        'email',
        document.getElementById('edit-user-email').value
      );
      formData.append('dni', document.getElementById('edit-user-dni').value);
      formData.append(
        'address',
        document.getElementById('edit-user-address').value
      );
      formData.append('city', document.getElementById('edit-user-city').value);
      formData.append(
        'country',
        document.getElementById('edit-user-country').value
      );
      formData.append(
        'birth_year',
        document.getElementById('edit-user-birth-year').value
      );
      formData.append(
        'gender',
        document.getElementById('edit-user-gender').value
      );
      formData.append(
        'phone',
        document.getElementById('edit-user-phone').value
      );
      formData.append(
        'phone_code',
        document.getElementById('country-code').value
      );
      formData.append('role', document.getElementById('edit-user-role').value);

      const password = document.getElementById('edit-user-password').value;
      if (password) {
        formData.append('password', password);
        formData.append(
          'password_confirmation',
          document.getElementById('edit-user-password-confirmation').value
        );
      }

      const response = await fetch(`${backendAPI}edit-user/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();

      if (data.success) {
        successMessage.classList.remove('d-none');
        setTimeout(() => successMessage.classList.add('d-none'), 5000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(data.message || 'Error al editar el usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      showError(error.message);
    } finally {
      loading.classList.add('d-none');
    }
  }
});
