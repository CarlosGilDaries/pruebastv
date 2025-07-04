async function editActionForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const select = document.getElementById('order');

  loadActionData(id);

  async function loadActionData(id) {
    try {
      const orderResponse = await fetch(backendAPI + 'actions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const orderData = await orderResponse.json();
      const positions = orderData.positions;

      positions.forEach((position) => {
        const option = document.createElement('option');
        option.innerHTML = position;
        option.value = position;
        select.appendChild(option);
      });

      const response = await fetch(`${backendAPI}action/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success && data.action) {
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
          'picture',
          'picture-name',
          'picture-label-text',
          data.action.picture
        );

        console.log(data);
        document.getElementById('name').value = data.action.name;
        document.getElementById('order').value = data.action.order;
        document.getElementById('text').value = data.action.text;
        document.getElementById('subtext').value = data.action.subtext;
        document.getElementById('button_text').value = data.action.button_text;
        document.getElementById('url').value = data.action.url;
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Manejar el envío del formulario
  document
    .getElementById('edit-action-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      const id = localStorage.getItem('id');

      document.getElementById('loading').style.display = 'block';

      try {
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('order', document.getElementById('order').value);
        formData.append('text', document.getElementById('text').value);
        formData.append('subtext', document.getElementById('subtext').value);
        formData.append('button_text', document.getElementById('button_text').value);
        const coverInput = document.getElementById('picture');
        if (coverInput && coverInput.files.length > 0) {
          formData.append('picture', coverInput.files[0]);
        } else {
          formData.append('picture', ''); // Envía un valor vacío si no hay archivo
        }
        formData.append('url', document.getElementById('url').value);


        const response = await fetch(`${backendAPI}edit-action/${id}`, {
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

editActionForm();
