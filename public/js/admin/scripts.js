import { getScriptsFromKey } from '../modules/getScriptsFromDB.js';

async function scriptsForm() {
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const id = localStorage.getItem('id');

  await loadScriptData();

  // Función para cargar datos del género
  async function loadScriptData() {
    try {
      const response = await fetch(`${backendAPI}all-scripts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los scripts');
      }

      const data = await response.json();

      if (data.success) {
        const indexValues = getScriptsFromKey(data.scripts, 'index');
        const categoriesValues = getScriptsFromKey(data.scripts, 'categories');
        const genderValues = getScriptsFromKey(data.scripts, 'genders');
        const tagsValues = getScriptsFromKey(data.scripts, 'tags');
        const plansValues = getScriptsFromKey(data.scripts, 'plans');
        const profileValues = getScriptsFromKey(data.scripts, 'profile');
        const seenValues = getScriptsFromKey(data.scripts, 'seen');
        const favoritesValues = getScriptsFromKey(data.scripts, 'favorites');
        const paidResourcesValues = getScriptsFromKey(
          data.scripts,
          'paid-resources'
        );
        const paymentHistoryValues = getScriptsFromKey(
          data.scripts,
          'payment-history'
        );
        const legalNoticeValues = getScriptsFromKey(
          data.scripts,
          'legal-notice'
        );
        const privacyPolicyValues = getScriptsFromKey(
          data.scripts,
          'privacy-policy'
        );
        const paymentPolicyValues = getScriptsFromKey(
          data.scripts,
          'payment-policy'
        );
        const cookiesValues = getScriptsFromKey(data.scripts, 'cookies');
        const contactValues = getScriptsFromKey(data.scripts, 'contact');

        setInputScriptValues(indexValues, 'index');
        setInputScriptValues(categoriesValues, 'categories');
        setInputScriptValues(genderValues, 'genders');
        setInputScriptValues(tagsValues, 'tags');
        setInputScriptValues(plansValues, 'plans');
        setInputScriptValues(profileValues, 'profile');
        setInputScriptValues(seenValues, 'seen');
        setInputScriptValues(favoritesValues, 'favorites');
        setInputScriptValues(paidResourcesValues, 'paid-resources');
        setInputScriptValues(paymentHistoryValues, 'payment-history');
        setInputScriptValues(legalNoticeValues, 'legal-notice');
        setInputScriptValues(privacyPolicyValues, 'privacy-policy');
        setInputScriptValues(paymentPolicyValues, 'payment-policy');
        setInputScriptValues(cookiesValues, 'cookies');
        setInputScriptValues(contactValues, 'contact');
      } else {
        throw new Error(data.message || 'Error al cargar el script');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('Error al cargar los scripts: ' + error.message, 'danger');
    }
  }

  // Manejar envío de formularios

  const forms = [
    'index',
    'genders',
    'categories',
    'tags',
    'profile',
    'plans',
    'seen',
    'favorites',
    'paid-resources',
    'payment-history',
    'legal-notice',
    'payment-policy',
    'privacy-policy',
    'cookies',
    'contact',
  ];

  forms.forEach((key) => {
    document
      .getElementById(key + '-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validar formulario
        if (!this.checkValidity()) {
          this.classList.add('was-validated');
          return;
        }

        document.getElementById('loading').classList.remove('d-none');
        document.querySelectorAll('.success-submit').forEach((element) => {
          element.classList.add('d-none');
        });

        try {
          let formData;
          formData = buildScriptFormData(key);

          const response = await fetch(
            `${backendAPI}edit-generic-script/${key}`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          );

          const data = await response.json();

          if (!response.ok) {
            // Mostrar errores de validación del servidor
            if (data.errors) {
              for (const field in data.errors) {
                const errorElement = document.getElementById(`${field}-error`);
                if (errorElement) {
                  errorElement.textContent = data.errors[field][0];
                  errorElement.style.display = 'block';
                }
              }
            } else {
              throw new Error(data.message || 'Error al editar el script');
            }
            return;
          }

          // Mostrar mensaje de éxito
          document.querySelectorAll('.success-submit').forEach((element) => {
            element.classList.remove('d-none');
          });

          setTimeout(() => {
            document.querySelectorAll('.success-submit').forEach((element) => {
              element.classList.add('d-none');
            });
          }, 5000);
        } catch (error) {
          console.error('Error submitting form:', error);
          showAlert('Error al editar el script: ' + error.message, 'danger');
        } finally {
          document.getElementById('loading').classList.add('d-none');
        }
      });
  });
}

function buildScriptInputs() {
  document.querySelectorAll('form').forEach((form) => {
    // Obtener el id del formulario (por ejemplo "legal-notice-form")
    const formId = form.id;
    // Eliminar la parte final "-form" → "legal-notice"
    const baseId = formId.replace(/-form$/, '');

    const scriptFields = `
        <div class="row">
            <div class="col-md-6 mb-3">
            <label for="${baseId}-google_id" class="form-label">Google ID</label>
            <input type="text" class="form-control" id="${baseId}-google_id" name="${baseId}-google_id">
            <div id="${baseId}-google_id-error" class="invalid-feedback"></div>
            </div>
        </div>
        <div class="row">
            <div class="col-12 mb-3">
            <label for="${baseId}-code" class="form-label">Código</label>
            <textarea class="form-control" id="${baseId}-code" name="${baseId}-code"></textarea>
            <div id="${baseId}-code-error" class="invalid-feedback"></div>
            </div>
        </div>
        <button type="submit" class="btn btn-success">Guardar Configuración</button>
    `;

    form.innerHTML = scriptFields;
  });
}

function setInputScriptValues(script, key) {
  if (script != null) {
    document.getElementById(key + '-code').value = script.code;
    document.getElementById(key + '-google_id').value = script.google_id;
  }
}

function buildScriptFormData(key) {
  const scriptFormData = new FormData();

  const fields = [
    { id: key + '-code', name: 'code' },
    { id: key + '-google_id', name: 'google_id' },
  ];

  fields.forEach((field) => {
    const element = document.getElementById(field.id);
    if (element && element.value.trim() !== '') {
      scriptFormData.append(field.name, element.value.trim());
    }
  });

  scriptFormData.append('key', key);

  return scriptFormData;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  buildScriptInputs();
  scriptsForm();
});
