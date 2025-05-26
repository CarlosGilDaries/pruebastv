async function initAddCategory() {
  const backendAPI = 'https://pruebastv.kmc.es/api/';
  const authToken = localStorage.getItem('auth_token');
  const select = document.getElementById('priority');

  try {
    const response = await fetch(backendAPI + 'categories', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    const priorities = data.priorities;

    if (priorities != null) {
      priorities.forEach(priority => {
        const option = document.createElement('option');
        option.innerHTML = priority;
        option.value = priority;
        select.appendChild(option);
      });

      const lastOption = document.createElement('option');
      option.innerHTML = priorities.length;
      option.value = priorities.length;
      select.appendChild(lastOption);
    } else {
      const lastOption = document.createElement('option');
      option.innerHTML = 1;
      option.value = 1;
      select.appendChild(lastOption);
    }

    // Manejar envío del formulario
    document
      .getElementById('add-category-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        // Resetear mensajes de error
        document
          .querySelectorAll('#add-category-form .error-message')
          .forEach((el) => (el.textContent = ''));
        document.getElementById('add-category-success-message').style.display =
          'none';

        // Mostrar loader
        document.getElementById('add-category-loading').style.display = 'block';

        // Obtener token de autenticación
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        // Crear FormData
        const formAdData = new FormData();
        formAdData.append(
          'name',
          document.getElementById('add-category-name').value
        );

        try {
          const response = await fetch(backendAPI + 'add-category', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formAdData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error al subir la categoría');
          }

          // Mostrar mensaje de éxito
          document.getElementById('add-category-success-message').style.display =
            'block';
          setTimeout(() => {
            document.getElementById(
              'add-category-success-message'
            ).style.display = 'none';
          }, 5000);

          // Resetear formulario
          document.getElementById('add-category-form').reset();
        } catch (error) {
          console.error('Error:', error);
        } finally {
          document.getElementById('add-category-loading').style.display = 'none';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  } catch (error) {
    console.log(error);
  }
}

initAddCategory();
