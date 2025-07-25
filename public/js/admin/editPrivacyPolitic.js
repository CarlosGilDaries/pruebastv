async function editPrivacyPoliticForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';

  // Cargar datos iniciales
  await loadPrivacyPoliticData(id);

  async function loadPrivacyPoliticData(id) {
    try {
      const response = await fetch(`${backendAPI}privacy-politic/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        document.getElementById('edit-title').value = data.privacyPolitic.title;
        CKEDITOR.instances.text.setData(data.privacyPolitic.text);
      } else {
        console.error('Error:', data.message);
        showError('Error al cargar los datos');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error de conexión al cargar los datos');
    }
  }

  // Mostrar mensaje de error
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    document.getElementById('privacy-politic-form').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  // Validación del formulario
  document
    .getElementById('privacy-politic-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
      }

      submitForm();
    });

  // Envío del formulario
  async function submitForm() {
    const loadingElement = document.getElementById('loading');
    const successMessage = document.getElementById('success-message');
    const form = document.getElementById('privacy-politic-form');

    loadingElement.classList.remove('d-none');
    form.classList.add('was-validated');

    try {
      const formData = new FormData();
      formData.append('title', document.getElementById('edit-title').value);
      formData.append('text', CKEDITOR.instances.text.getData());

      const response = await fetch(`${backendAPI}edit-privacy-politic/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        successMessage.classList.remove('d-none');
        setTimeout(() => {
          successMessage.classList.add('d-none');
        }, 5000);
      } else {
        showError(data.message || 'Error al editar la política de privacidad');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showError('Error de conexión al enviar el formulario');
    } finally {
      loadingElement.classList.add('d-none');
    }
  }
}

// Inicializar la función cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  // Asegurarse de que CKEditor esté listo
  if (typeof CKEDITOR !== 'undefined') {
    CKEDITOR.on('instanceReady', function () {
      editPrivacyPoliticForm();
    });
  } else {
    editPrivacyPoliticForm();
  }
});
