document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('auth_token');
    const form = document.getElementById('mail-form');

    loadMailSettingsData();

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      await submitMailSettings();
    });

    async function loadMailSettingsData() {
      const loading = document.getElementById('loading');
      loading.classList.remove('d-none');

      try {
        const response = await fetch('/api/mail-config/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const templatesResponse = await fetch('/api/mail-templates', {
          headers: { Authorization: `Bearer ${token}` },
        });

          const data = await response.json();
          const templatesData = await templatesResponse.json();
          const config = data.config;
          const templates = templatesData.templates;
          console.log(templates);

        // Llenar campos del formulario
        document.getElementById('mail_username').value = config.mail_username || '';
        document.getElementById('mail_port').value = config.mail_port || '';
        document.getElementById('mail_mailer').value = config.mail_mailer || '';
        document.getElementById('mail_host').value = config.mail_host || '';
        document.getElementById('mail_encryption').value = config.mail_encryption || '';

      } catch (error) {
        console.error('Error cargando contenido:', error);
      } finally {
        loading.classList.add('d-none');
      }
    }

    async function submitMailSettings() {
      const loading = document.getElementById('loading');
      const successMessage = document.getElementById('success-message');

      loading.classList.remove('d-none');
      successMessage.classList.add('d-none');

      try {
        const formData = new FormData();
        formData.append(
          'mail_mailer',
          document.getElementById('mail_mailer').value
        );
        formData.append(
          'mail_encryption',
          document.getElementById('mail_encryption').value
        );
        formData.append(
          'mail_host',
          document.getElementById('mail_host').value
        );
        formData.append(
          'mail_port',
          document.getElementById('mail_port').value
        );
        formData.append(
          'mail_username',
          document.getElementById('mail_username').value
          );
          
          if (document.getElementById('mail_password').value != "") {
            formData.append(
              'mail_password',
              document.getElementById('mail_password').value
            );
        }

        const response = await fetch('/api/edit-mail-config', {
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
          throw new Error(data.message || 'Error al actualizar los ajustes');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        loading.classList.add('d-none');
      }
    }
});
