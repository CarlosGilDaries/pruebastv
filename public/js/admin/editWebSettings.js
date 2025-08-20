document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('auth_token');
  const form = document.getElementById('web-form');

  // Cargar datos iniciales
  loadWebSettingsData();

  // Manejar el envío del formulario
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    await submitWebSettings();
  });

  async function loadWebSettingsData() {
    const loading = document.getElementById('loading');
    loading.classList.remove('d-none');

    try {
      const response = await fetch('/api/company-details/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos');
      }

      const data = await response.json();
      const details = data.details;

      // Llenar campos del formulario
      document.getElementById('name').value = details.name || '';
      document.getElementById('fiscal_address').value =
        details.fiscal_address || '';
      document.getElementById('nif_cif').value = details.nif_cif || '';
      document.getElementById('email').value = details.email || '';
      document.getElementById('facebook').value = details.facebook || '';
      document.getElementById('instagram').value = details.instagram || '';
      document.getElementById('twitter').value = details.twitter || '';

      // Configurar CKEditor si está disponible
      if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances) {
        CKEDITOR.instances.commercial_registry_text.setData(
          details.commercial_registry_text || ''
        );
        CKEDITOR.instances.lopd_text.setData(details.lopd_text || '');
      }

      // Mostrar imágenes actuales si existen
      if (details.favicon) {
        document.getElementById('current-favicon').innerHTML = `
                    <p class="mb-1">Favicon actual:</p>
                    <img src="${details.favicon}" alt="Favicon actual" style="max-width: 32px; height: auto;">
                `;
      }

      if (details.logo) {
        document.getElementById('current-logo').innerHTML = `
                    <p class="mb-1">Logo actual:</p>
                    <img src="${details.logo}" alt="Logo actual" style="max-width: 200px; height: auto;">
                `;
      }

      if (details.invoice_logo) {
        document.getElementById('current-invoice-logo').innerHTML = `
                    <p class="mb-1">Logo para Facturas actual:</p>
                    <img src="${details.invoice_logo}" alt="Logo para Facturas actual" style="max-width: 200px; height: auto;">
                `;
      }
    } catch (error) {
      console.error('Error cargando contenido:', error);
      showError('Error al cargar los ajustes: ' + error.message);
    } finally {
      loading.classList.add('d-none');
    }
  }

  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    form.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  async function submitWebSettings() {
    const loading = document.getElementById('loading');
    const successMessage = document.getElementById('success-message');

    loading.classList.remove('d-none');
    successMessage.classList.add('d-none');

    try {
      const formData = new FormData();
      formData.append('name', document.getElementById('name').value);
      formData.append(
        'fiscal_address',
        document.getElementById('fiscal_address').value
      );
      formData.append('nif_cif', document.getElementById('nif_cif').value);
      formData.append('email', document.getElementById('email').value);
      formData.append('facebook', document.getElementById('facebook').value);
      formData.append('instagram', document.getElementById('instagram').value);
      formData.append('twitter', document.getElementById('twitter').value);

      // Agregar contenido de CKEditor si está disponible
      if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances) {
        formData.append(
          'commercial_registry_text',
          CKEDITOR.instances.commercial_registry_text.getData()
        );
        formData.append('lopd_text', CKEDITOR.instances.lopd_text.getData());
      }

      // Agregar archivos si se seleccionaron
      const faviconInput = document.getElementById('favicon_input');
      if (faviconInput.files.length > 0) {
        formData.append('favicon', faviconInput.files[0]);
      }

      const logoInput = document.getElementById('logo_input');
      if (logoInput.files.length > 0) {
        formData.append('logo', logoInput.files[0]);
      }

      const invoiceLogoInput = document.getElementById('invoice_logo_input');
      if (invoiceLogoInput.files.length > 0) {
        formData.append('invoice_logo', invoiceLogoInput.files[0]);
      }

      const response = await fetch('/api/edit-company-details', {
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

        // Recargar datos para mostrar las nuevas imágenes
        loadWebSettingsData();
      } else {
        throw new Error(data.message || 'Error al actualizar los ajustes');
      }
    } catch (error) {
      console.error('Error:', error);
      showError(error.message);
    } finally {
      loading.classList.add('d-none');
    }
  }
});
