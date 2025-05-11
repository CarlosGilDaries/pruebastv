async function initAddUser() {
  const backendAPI = 'https://pruebastv.kmc.es/api/';

  const form = document.getElementById('add-user-form');
  const planSelect = document.getElementById('add-user-plan');
  const successMessage = document.getElementById('add-user-success-message');
  const loading = document.getElementById('add-user-loading');

  // Obtener token
  const authToken = localStorage.getItem('auth_token');
  if (!authToken) {
    window.location.href = '/login';
    return;
  }

  // Cargar planes dinámicamente
  try {
    const response = await fetch(backendAPI + 'plans', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    const plansData = await response.json();
	const plans = plansData.plans;

    plans.forEach(plan => {
      const option = document.createElement('option');
      option.value = plan.id;
      option.textContent = plan.name;
      planSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar planes:', error);
  }

  // Manejar envío del formulario
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Resetear mensajes de error
    document.querySelectorAll('#add-user-form .error-message')
      .forEach(el => el.textContent = '');
    successMessage.style.display = 'none';
    loading.style.display = 'block';

    // Construir FormData
    const formData = new FormData();
    formData.append('name', document.getElementById('add-user-name').value);
    formData.append('surnames', document.getElementById('add-user-surnames').value);
    formData.append('email', document.getElementById('add-user-email').value);
    formData.append('dni', document.getElementById('add-user-dni').value);
    formData.append('address', document.getElementById('add-user-address').value);
    formData.append('city', document.getElementById('add-user-city').value);
    formData.append('country', document.getElementById('add-user-country').value);
    formData.append('birthday', document.getElementById('add-user-birthday').value);
    formData.append('gender', document.getElementById('add-user-gender').value);
    formData.append('plan', document.getElementById('add-user-plan').value);
    formData.append('password', document.getElementById('add-user-password').value);
    formData.append('password_confirmation', document.getElementById('add-user-password-confirmation').value);

    try {
      const response = await fetch(backendAPI + 'register', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          for (let field in data.errors) {
            const errorDiv = document.getElementById(`add-user-${field}-error`);
            if (errorDiv) errorDiv.textContent = data.errors[field][0];
          }
        } else {
          throw new Error(data.message || 'Error al registrar el usuario');
        }
        return;
      }

      // Mostrar éxito
      successMessage.style.display = 'block';
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 5000);
      form.reset();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      loading.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

initAddUser();
