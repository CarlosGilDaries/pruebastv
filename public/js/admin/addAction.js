async function initAddAction() {
  const backendAPI = '/api/';
  const authToken = localStorage.getItem('auth_token');
  const select = document.getElementById('order');

  try {
    const response = await fetch(backendAPI + 'actions', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    const positions = data.positions;

    if (positions != null) {
      positions.forEach((position) => {
        const option = document.createElement('option');
        option.innerHTML = position;
        option.value = position;
        select.appendChild(option);
      });

      const lastOption = document.createElement('option');
      lastOption.innerHTML = positions.length + 1;
      lastOption.value = positions.length + 1;
      select.appendChild(lastOption);
    } else {
      const option = document.createElement('option');
      option.innerHTML = 1;
      option.value = 1;
      select.appendChild(option);
    }

    // Mostrar nombre de archivos seleccionados
    const setupFileInput = (inputId, nameId, labelId) => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('change', function (e) {
          const fileName =
            e.target.files[0]?.name || 'Ningún archivo seleccionado';
          if (nameId) document.getElementById(nameId).textContent = fileName;
          if (labelId) document.getElementById(labelId).textContent = fileName;
        });
      }
    };

    setupFileInput('picture', 'picture-name', 'picture-label-text');

    // Manejar envío del formulario
    document
      .getElementById('add-action-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        // Resetear mensajes de error
        document
          .querySelectorAll('#add-action-form .error-message')
          .forEach((el) => (el.textContent = ''));
        document.getElementById('success-message').style.display = 'none';

        // Mostrar loader
        document.getElementById('loading').style.display = 'block';

        // Obtener token de autenticación
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        // Crear FormData
        const formAdData = new FormData();
        formAdData.append('name', document.getElementById('name').value);
        formAdData.append('order', document.getElementById('order').value);
        formAdData.append('text', document.getElementById('text').value);
        formAdData.append('subtext', document.getElementById('subtext').value);
        formAdData.append('button_text', document.getElementById('button_text').value);
        if (document.getElementById('picture')) {
          formAdData.append('picture', document.getElementById('picture').files[0]);
        }
        formAdData.append('url', document.getElementById('url').value);

        try {
          const response = await fetch(backendAPI + 'add-action', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formAdData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error al subir la acción');
          }

          // Mostrar mensaje de éxito
          document.getElementById('success-message').style.display = 'block';
          setTimeout(() => {
            document.getElementById('success-message').style.display = 'none';
          }, 5000);

          // Resetear formulario
          document.getElementById('add-action-form').reset();
        } catch (error) {
          console.error('Error:', error);
        } finally {
          document.getElementById('loading').style.display = 'none';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  } catch (error) {
    console.log(error);
  }
}

initAddAction();
