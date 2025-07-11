async function editFooterItemForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const select = document.getElementById('order');

  loadFooterItemData(id);

  async function loadFooterItemData(id) {
    try {
      const response = await fetch(`${backendAPI}footer-item/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        // Configurar inputs de archivo para mostrar nombre
        const setupFileInput = (
          inputId,
          nameId,
          labelId,
          currentPath = null
        ) => {
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
          'logo_input',
          'logo_input-name',
          'logo_input-label-text',
          data.footerItem.logo
        );

        console.log(data);
        document.getElementById('name').value = data.footerItem.name;
        document.getElementById('url').value = data.footerItem.url;
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Manejar el envío del formulario
  document
    .getElementById('edit-footer-item-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      const id = localStorage.getItem('id');

      document.getElementById('loading').style.display = 'block';

      try {
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('url', document.getElementById('url').value);
        const coverInput = document.getElementById('logo_input');
        if (coverInput && coverInput.files.length > 0) {
          formData.append('logo', coverInput.files[0]);
        } else {
          formData.append('logo', ''); // Envía un valor vacío si no hay archivo
        }

        const response = await fetch(`${backendAPI}edit-footer-item/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          document.getElementById('success-message').style.display = 'block';
          setTimeout(() => {
            document.getElementById('success-message').style.display = 'none';
          }, 5000);
        } else {
          console.log(data);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        document.getElementById('loading').style.display = 'none';
      }
    });
}

editFooterItemForm();
