import { getScriptsByKey } from '../modules/getScriptsFromDB.js';
import { showAlert } from '../modules/showAlert.js';

async function scriptsForm() {
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const id = localStorage.getItem('id');

  await loadScriptData();

  // Función para cargar datos del género
  async function loadScriptData() {
    try {
      const response = await fetch(`${backendAPI}scripts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los scripts');
      }

      const data = await response.json();

      if (data.success) {
        const googleBaseValues = getScriptsByKey(data.scripts, 'base-google');
        const googleBaseCode =
          googleBaseValues === null ? null : googleBaseValues.google;
        const indexValues = getScriptsByKey(data.scripts, 'index');
        const categoriesValues = getScriptsByKey(data.scripts, 'categories');
        const genderValues = getScriptsByKey(data.scripts, 'genders');
        const tagsValues = getScriptsByKey(data.scripts, 'tags');
        const plansValues = getScriptsByKey(data.scripts, 'plans');
        const profileValues = getScriptsByKey(data.scripts, 'profile');
        const seenValues = getScriptsByKey(data.scripts, 'seen');
        const favoritesValues = getScriptsByKey(data.scripts, 'favorites');
        const paidResourcesValues = getScriptsByKey(
          data.scripts,
          'paid-resources'
        );
        const paymentHistoryValues = getScriptsByKey(
          data.scripts,
          'payment-history'
        );
        const legalNoticeValues = getScriptsByKey(data.scripts, 'legal-notice');
        const privacyPolicyValues = getScriptsByKey(
          data.scripts,
          'privacy-policy'
        );
        const paymentPolicyValues = getScriptsByKey(
          data.scripts,
          'payment-policy'
        );
        const cookiesValues = getScriptsByKey(data.scripts, 'cookies');
        const contactValues = getScriptsByKey(data.scripts, 'contact');

        setInputScriptValues(indexValues, 'index', googleBaseCode);
        setInputScriptValues(googleBaseValues, 'base');
        setInputScriptValues(categoriesValues, 'categories', googleBaseCode);
        setInputScriptValues(genderValues, 'genders', googleBaseCode);
        setInputScriptValues(tagsValues, 'tags', googleBaseCode);
        setInputScriptValues(plansValues, 'plans', googleBaseCode);
        setInputScriptValues(profileValues, 'profile', googleBaseCode);
        setInputScriptValues(seenValues, 'seen', googleBaseCode);
        setInputScriptValues(favoritesValues, 'favorites', googleBaseCode);
        setInputScriptValues(
          paidResourcesValues,
          'paid-resources',
          googleBaseCode
        );
        setInputScriptValues(
          paymentHistoryValues,
          'payment-history',
          googleBaseCode
        );
        setInputScriptValues(legalNoticeValues, 'legal-notice', googleBaseCode);
        setInputScriptValues(
          privacyPolicyValues,
          'privacy-policy',
          googleBaseCode
        );
        setInputScriptValues(
          paymentPolicyValues,
          'payment-policy',
          googleBaseCode
        );
        setInputScriptValues(cookiesValues, 'cookies', googleBaseCode);
        setInputScriptValues(contactValues, 'contact', googleBaseCode);
      } else {
        throw new Error(data.message || 'Error al cargar el script');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Manejar envío de formularios

  const forms = [
    'base-google',
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
          let googleFormData;
          googleFormData = buildScriptFormData(key, 'google');

          const response = await fetch(
            `${backendAPI}edit-generic-script/google`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: googleFormData,
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
          }, 2000);
        } catch (error) {
          console.error('Error submitting form:', error);
          showAlert(
            'Error al editar el script: ' + error.message,
            'danger',
            type
          );
        } finally {
          document.getElementById('loading').classList.add('d-none');
        }
      });
  });
}

function buildScriptInputs(scriptTypes) {
  document.querySelectorAll('form').forEach((form) => {
    if (!form.id.includes('base')) {
      const formId = form.id;
      const baseId = formId.replace(/-form$/, '');

      let scriptFields = '';

      scriptTypes.forEach((type) => {
        const label = type.charAt(0).toUpperCase() + type.slice(1);

        scriptFields += `
        <div class="row">
          <h3 class="mb-2">${label}</h3>
          <div class="col-12 mb-3">
            <label for="${baseId}-${type}-code" class="form-label">Código</label>
            <textarea class="form-control" id="${baseId}-${type}-code" name="${baseId}-${type}-code"></textarea>
            <div id="${baseId}-${type}-code-error" class="invalid-feedback"></div>
          </div>
        </div>
      `;
      });

      scriptFields += `<button type="submit" class="btn btn-success">Guardar Configuración</button>`;

      form.innerHTML = scriptFields;
    }
  });
}

function setInputScriptValues(scriptMap, key, googleScript = null) {
  if (!scriptMap) {
    /*const googleInput = document.getElementById(`${key}-google-code`);
    if (googleInput) googleInput.value = googleScript;*/
    return;
  }

  for (const [type, code] of Object.entries(scriptMap)) {
    const input = document.getElementById(`${key}-${type}-code`);
    if (input) input.value = code;
    if (type == 'google_id') {
      const idInput = document.getElementById(`base-google-site-id`);
      if (idInput) idInput.value = code;
    }
  }
}

function buildScriptFormData(key, type) {
  const scriptFormData = new FormData();
  let fields;
  if (key.includes('base')) {
    fields = [{ id: key + '-code', name: 'code', site_id: key + '-site-id' }];
  } else {
    fields = [{ id: key + '-' + type + '-code', name: 'code' }];
  }

  fields.forEach((field) => {
    const element = document.getElementById(field.id);
    const siteIdElement = document.getElementById(field.site_id);
    if (element && element.value.trim() !== '') {
      scriptFormData.append(field.name, element.value.trim());
    }
    if (siteIdElement && siteIdElement.value.trim() !== '') {
      scriptFormData.append('site_id', siteIdElement.value.trim());
    }
  });

  scriptFormData.append('key', key);

  return scriptFormData;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  const types = ['google'];
  buildScriptInputs(types);
  scriptsForm();
});
