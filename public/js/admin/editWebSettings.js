async function editWebSettingsForm() {
  const token = localStorage.getItem('auth_token');

  loadWebSettingsData();

  async function loadWebSettingsData() {
    try {
      const response = await fetch(`/api/company-details/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
        const data = await response.json();
        const details = data.details;

      // Configurar inputs de archivo para mostrar nombre
      const setupFileInput = (inputId, nameId, labelId, currentPath = null) => {
        const input = document.getElementById(inputId);
        const nameElement = document.getElementById(nameId);
        const labelElement = document.getElementById(labelId);

        if (currentPath) {
          const fileName = currentPath.split('/').pop();
          if (nameElement) nameElement.textContent = fileName;
          if (labelElement) labelElement.textContent = fileName;
        }

        if (input) {
          input.addEventListener('change', function (e) {
            // Verificar primero si hay archivos seleccionados
            const fileName =
              e.target.files && e.target.files.length > 0
                ? e.target.files[0].name
                : 'Ningún archivo seleccionado';

            if (nameElement) nameElement.textContent = fileName;
            if (labelElement) labelElement.textContent = fileName;
          });
        }
      };

        setupFileInput(
          'favicon_input',
          'favicon_input-name',
          'favicon_input-label-text',
          details.favicon
        );
        setupFileInput(
          'logo_input',
          'logo_input-name',
          'logo_input-label-text',
          details.logo
        );

      document.getElementById('name').value = details.name;
        document.getElementById('fiscal_address').value = details.fiscal_address;
        document.getElementById('nif_cif').value = details.nif_cif;
        document.getElementById('email').value = details.email;
        document.getElementById('facebook').value = details.facebook;
        document.getElementById('instagram').value =
            details.instagram;
            document.getElementById('twitter').value = details.twitter;

      CKEDITOR.instances.commercial_registry_text.setData(
        details.commercial_registry_text
      );
      CKEDITOR.instances.lopd_text.setData(details.lopd_text);

    } catch (error) {
      console.error('Error cargando contenido:', error);
    }
    }
    
  document
    .getElementById('web-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validar antes de enviar
      /*if (!validateAddForm()) {
        return;
      }*/

      document.getElementById('loading').style.display = 'block';
        
      const formData = new FormData();
      formData.append('name', document.getElementById('name').value);
      formData.append(
        'fiscal_address',
        document.getElementById('fiscal_address').value
      );
        formData.append('nif_cif', document.getElementById('nif_cif').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('facebook', document.getElementById('facebook').value);
        formData.append(
          'instagram',
          document.getElementById('instagram').value
        );
        formData.append('twitter', document.getElementById('twitter').value);
      formData.append(
        'commercial_registry_text',
        CKEDITOR.instances.commercial_registry_text.getData()
      );
      formData.append('lopd_text', CKEDITOR.instances.lopd_text.getData());

      const faviconInput = document.getElementById('favicon_input');
      if (faviconInput && faviconInput.files.length > 0) {
        formData.append('favicon', faviconInput.files[0]);
      } else {
        formData.append('favicon', ''); // Envía un valor vacío si no hay archivo
      }

      const logoInput = document.getElementById('logo_input');
      if (logoInput && logoInput.files.length > 0) {
        formData.append('logo', logoInput.files[0]);
      } else {
        formData.append('logo', ''); // Envía un valor vacío si no hay archivo
      }

      try {
        const editResponse = await fetch(`/api/edit-company-details`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await editResponse.json();

        if (data.success) {
          // Mostrar mensaje de éxito
          document.getElementById('success-message').style.display = 'block';

          setTimeout(() => {
            document.getElementById('success-message').style.display = 'none';
          }, 5000);

          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          console.log('Error al editar:', data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        document.getElementById('loading').style.display = 'none';
      }
    });
}

editWebSettingsForm();