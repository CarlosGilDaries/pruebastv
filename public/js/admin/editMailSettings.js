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

        // Llenar campos del formulario
        document.getElementById('mail_username').value = config.mail_username || '';
        document.getElementById('mail_port').value = config.mail_port || '';
        document.getElementById('mail_mailer').value = config.mail_mailer || '';
        document.getElementById('mail_host').value = config.mail_host || '';
        document.getElementById('mail_encryption').value = config.mail_encryption || '';
        fillEmailTexts(templates);

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
        // Primer FormData: Configuración del email
        const configFormData = new FormData();
        configFormData.append(
          'mail_mailer',
          document.getElementById('mail_mailer').value
        );
        configFormData.append(
          'mail_encryption',
          document.getElementById('mail_encryption').value
        );
        configFormData.append(
          'mail_host',
          document.getElementById('mail_host').value
        );
        configFormData.append(
          'mail_port',
          document.getElementById('mail_port').value
        );
        configFormData.append(
          'mail_username',
          document.getElementById('mail_username').value
        );

        if (document.getElementById('mail_password').value != '') {
          configFormData.append(
            'mail_password',
            document.getElementById('mail_password').value
          );
        }

        // Segundo FormData: Plantillas de email
        const templatesFormData = new FormData();
        addEmailTemplatesToFormData(templatesFormData);

        // Primera petición: Configuración del email
        const configResponse = await fetch('/api/edit-mail-config', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: configFormData,
        });

        if (!configResponse.ok) {
          throw new Error('Error al actualizar la configuración del email');
        }

        const configData = await configResponse.json();

        if (!configData.success) {
          throw new Error(
            configData.message || 'Error al actualizar la configuración'
          );
        }

        // Segunda petición: Plantillas de email
        const templatesResponse = await fetch(
          '/api/edit-templates',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: templatesFormData,
          }
        );

        if (!templatesResponse.ok) {
          throw new Error('Error al actualizar las plantillas');
        }

        const templatesData = await templatesResponse.json();

        if (!templatesData.success) {
          throw new Error(
            templatesData.message || 'Error al actualizar las plantillas'
          );
        }

        // Éxito en ambas peticiones
        successMessage.classList.remove('d-none');
        setTimeout(() => successMessage.classList.add('d-none'), 5000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        loading.classList.add('d-none');
      }
    }
});

function fillEmailTexts(emailTemplates) {
  const emailMap = {};
  emailTemplates.forEach((email) => {
    emailMap[email.key] = email;
  });

  // Configuración de los tipos de email a manejar
  const emailTypes = [
    { key: 'verify_email', prefix: 'verify_email' },
    { key: 'reset_password', prefix: 'reset_password' },
    { key: 'free_one_day_left', prefix: 'free_one_day_left' },
    { key: 'free_two_days_left', prefix: 'free_two_days_left' },
    { key: 'expired_plan', prefix: 'expired_plan' },
    { key: 'free_first_warning', prefix: 'free_first_warning' },
    { key: 'plan_one_day_left', prefix: 'plan_one_day_left' },
    { key: 'plan_seven_days_left', prefix: 'plan_seven_days_left' },
  ];

  emailTypes.forEach((type) => {
    const data = emailMap[type.key];
    if (data) {
      fillFields(type.prefix, data);
    }
  });

  function fillFields(prefix, data) {
    const fields = [
      'subject',
      'body_spanish',
      'body_english',
      'button_text_spanish',
      'button_text_english',
    ];

    fields.forEach((field) => {
      const element = document.getElementById(`${prefix}_${field}`);
      if (element) {
        element.value = data[field] || '';
      }
    });
  }
}

function addEmailTemplatesToFormData(formData) {
  const prefixes = [
    'verify_email',
    'reset_password',
    'free_one_day_left',
    'free_two_days_left',
    'expired_plan',
    'free_first_warning',
    'plan_one_day_left',
    'plan_seven_days_left',
  ];
  const fields = [
    'subject',
    'body_spanish',
    'body_english',
    'button_text_spanish',
    'button_text_english',
  ];

  prefixes.forEach((prefix) => {
    fields.forEach((field) => {
      const element = document.getElementById(`${prefix}_${field}`);
      if (element) formData.append(`${prefix}_${field}`, element.value || '');
    });
  });
}