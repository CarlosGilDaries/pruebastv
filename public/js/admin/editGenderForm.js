async function editGenderForm() {
	let id;
	const token = localStorage.getItem('auth_token');
	const backendAPI = 'https://pruebastv.kmc.es/api/';
	
  if (document.getElementById('edit-gender-name').value == "") {
    id = localStorage.getItem('id');
    loadGenderData(id);
    // Escuchar cuando se muestra el formulario
    document
      .getElementById('edit-gender')
      .addEventListener('show', function () {
        id = localStorage.getItem('id');
        loadGenderData(id);
      });
  }

  // Función para cargar datos del género
  async function loadGenderData(id) {
    try {
      if (!id) {
        console.error('No ID provided for gender');
        return;
      }

      const response = await fetch(`${backendAPI}gender/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success && data.gender) {
        document.getElementById('edit-gender-name').value = data.gender.name;
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Manejar el envío del formulario
  document
    .getElementById('edit-gender-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      const id = localStorage.getItem('id');
      if (!id) {
        console.error('No gender ID found for submission');
        return;
      }

      document.getElementById('edit-gender-loading').style.display = 'block';

      try {
        const formData = new FormData();
        formData.append(
          'name',
          document.getElementById('edit-gender-name').value
        );

        const response = await fetch(`${backendAPI}edit-gender/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          document.getElementById('edit-gender-success-message').style.display =
            'block';
          setTimeout(() => {
            document.getElementById(
              'edit-gender-success-message'
            ).style.display = 'none';
          }, 5000);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        document.getElementById('edit-gender-loading').style.display = 'none';
      }
    });
}

editGenderForm();

