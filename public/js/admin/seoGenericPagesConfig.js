import { getSeoValuesFromKey } from "../modules/getSeoValuesFromKey.js";
import { setupSlugGenerator } from "../modules/setUpSlugGeneratos.js";

async function seoSettingsForm() {
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const id = localStorage.getItem('id');

  await loadSeoData();

  // Función para cargar datos del género
  async function loadSeoData() {
    try {
      const response = await fetch(`${backendAPI}all-seo-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos del género');
      }

      const data = await response.json();

      if (data.success) {
        const indexValues = getSeoValuesFromKey(data.settings, 'index');
        const categoriesValues = getSeoValuesFromKey(
          data.settings,
          'categories'
        );
        const genderValues = getSeoValuesFromKey(data.settings, 'genders');
        const tagsValues = getSeoValuesFromKey(data.settings, 'tags');
        const plansValues = getSeoValuesFromKey(data.settings, 'plans');
        const profileValues = getSeoValuesFromKey(data.settings, 'profile');
        const seenValues = getSeoValuesFromKey(data.settings, 'seen');
        const favoritesValues = getSeoValuesFromKey(data.settings, 'favorites');
        const paidResourcesValues = getSeoValuesFromKey(
          data.settings,
          'paid-resources'
        );
        const paymentHistoryValues = getSeoValuesFromKey(
          data.settings,
          'payment-history'
        );
        const legalNoticeValues = getSeoValuesFromKey(
          data.settings,
          'legal-notice'
        );
        const privacyPolicyValues = getSeoValuesFromKey(
          data.settings,
          'privacy-policy'
        );
        const paymentPolicyValues = getSeoValuesFromKey(
          data.settings,
          'payment-policy'
        );
        const cookiesValues = getSeoValuesFromKey(data.settings, 'cookies');
        const contactValues = getSeoValuesFromKey(data.settings, 'contact');

        setInputSeoValues(indexValues, 'index');
        setInputSeoValues(categoriesValues, 'categories');
        setInputSeoValues(genderValues, 'genders');
        setInputSeoValues(tagsValues, 'tags');
        setInputSeoValues(plansValues, 'plans');
        setInputSeoValues(profileValues, 'profile');
        setInputSeoValues(seenValues, 'seen');
        setInputSeoValues(favoritesValues, 'favorites');
        setInputSeoValues(paidResourcesValues, 'paid-resources');
        setInputSeoValues(paymentHistoryValues, 'payment-history');
        setInputSeoValues(legalNoticeValues, 'legal-notice');
        setInputSeoValues(privacyPolicyValues, 'privacy-policy');
        setInputSeoValues(paymentPolicyValues, 'payment-policy');
        setInputSeoValues(cookiesValues, 'cookies');
        setInputSeoValues(contactValues, 'contact');
      } else {
        throw new Error(data.message || 'Error al cargar el género');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('Error al cargar los seoSettings: ' + error.message, 'danger');
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
      'contact'
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
          formData = buildSeoFormData(key);

          const response = await fetch(
            `${backendAPI}edit-generic-seo-settings/${key}`,
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
              throw new Error(data.message || 'Error al editar el género');
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
          showAlert('Error al editar el género: ' + error.message, 'danger');
        } finally {
          document.getElementById('loading').classList.add('d-none');
        }
      });
  });
}

function buildSeoInputs() {
  document.querySelectorAll('form').forEach((form) => {
    // Obtener el id del formulario (por ejemplo "legal-notice-form")
    const formId = form.id;
    // Eliminar la parte final "-form" → "legal-notice"
    const baseId = formId.replace(/-form$/, '');

    // Plantilla HTML con los campos SEO
    const seoFields = `
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="${baseId}-seo-title" class="form-label">Title</label>
          <input type="text" class="form-control" id="${baseId}-seo-title" name="${baseId}-seo-title" />
          <div id="${baseId}-seo-title-error" class="invalid-feedback"></div>
        </div>
        <div class="col-md-6 mb-3">
          <label for="${baseId}-seo-url" class="form-label">Alias</label>
          <input type="text" class="form-control" id="${baseId}-seo-url" name="${baseId}-seo-url">
          <div id="${baseId}-seo-url-error" class="invalid-feedback"></div>
        </div>
      </div>
      <div class="row">
      <div class="col-md-6 mb-3">
          <label for="${baseId}-seo-keywords" class="form-label">Keywords</label>
          <input type="text" class="form-control" id="${baseId}-seo-keywords" name="${baseId}-seo-keywords" />
          <div id="${baseId}-seo-keywords-error" class="invalid-feedback"></div>
        </div>
        <div class="col-md-6 mb-3">
          <label for="${baseId}-seo-robots" class="form-label">Robots</label>
          <input type="text" class="form-control" id="${baseId}-seo-robots" name="${baseId}-seo-robots" />
          <div id="${baseId}-seo-robots-error" class="invalid-feedback"></div>
        </div>
      </div>
      <div class="row">
        <div class="col-12 mb-3">
          <label for="${baseId}-seo-canonical" class="form-label">Canonical</label>
          <input type="text" class="form-control" id="${baseId}-seo-canonical" name="${baseId}-seo-canonical" />
          <div id="${baseId}-seo-canonical-error" class="invalid-feedback"></div>
        </div>
      </div>
      <div class="row">
        <div class="col-12 mb-3">
          <label for="${baseId}-seo-description" class="form-label">Description</label>
          <input type="text" class="form-control" id="${baseId}-seo-description" name="${baseId}-seo-description">
          <div id="${baseId}-seo-description-error" class="invalid-feedback"></div>
        </div>
      </div>
      <button type="submit" class="btn btn-success">Guardar Configuración</button>
    `;

    form.innerHTML = seoFields;
  });
}

// Función auxiliar para mostrar alertas
function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
  alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
  document.getElementById('edit-gender').prepend(alertDiv);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    const bsAlert = new bootstrap.Alert(alertDiv);
    bsAlert.close();
  }, 5000);
}

function setInputSeoValues(seoSettings, key) {
  if (seoSettings != null) {
    document.getElementById(key + '-seo-title').value = seoSettings.title;
    document.getElementById(key + '-seo-robots').value = seoSettings.robots;
    document.getElementById(key + '-seo-canonical').value = seoSettings.canonical;
    document.getElementById(key + '-seo-description').value =
      seoSettings.description;
    document.getElementById(key + '-seo-url').value = seoSettings.url;
    document.getElementById(key + '-seo-keywords').value = seoSettings.keywords;
  }
}

function buildSeoFormData(key) {
  const seoFormData = new FormData();

  const fields = [
    { id: key + '-seo-title', name: 'title' },
    { id: key + '-seo-keywords', name: 'keywords' },
    { id: key + '-seo-robots', name: 'robots' },
    { id: key + '-seo-canonical', name: 'canonical' },
    { id: key + '-seo-url', name: 'url' },
    { id: key + '-seo-description', name: 'description' },
  ];

  fields.forEach((field) => {
    const element = document.getElementById(field.id);
    if (element && element.value.trim() !== '') {
      seoFormData.append(field.name, element.value.trim());
    }
  });

  seoFormData.append('key', key);

  return seoFormData;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  buildSeoInputs();
  setupSlugGenerator('index-seo-title', 'index-seo-url');
  setupSlugGenerator('categories-seo-title', 'categories-seo-url');
  setupSlugGenerator('genders-seo-title', 'genders-seo-url');
  setupSlugGenerator('tags-seo-title', 'tags-seo-url');
  setupSlugGenerator('plans-seo-title', 'plans-seo-url');
  setupSlugGenerator('profile-seo-title', 'profile-seo-url');
  setupSlugGenerator('seen-seo-title', 'seen-seo-url');
  setupSlugGenerator('favorites-seo-title', 'favorites-seo-url');
  setupSlugGenerator('paid-resources-seo-title', 'paid-resources-seo-url');
  setupSlugGenerator('payment-history-seo-title', 'payment-history-seo-url');
  setupSlugGenerator('legal-notice-seo-title', 'legal-notice-seo-url');
  setupSlugGenerator('privacy-policy-seo-title', 'privacy-policy-seo-url');
  setupSlugGenerator('payment-policy-seo-title', 'payment-policy-seo-url');
  setupSlugGenerator('cookies-seo-title', 'cookies-seo-url');
  setupSlugGenerator('contact-seo-title', 'contact-seo-url');
  seoSettingsForm();
});
