async function editTagForm() {
	const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  let id = localStorage.getItem('id');
  
  loadTagData(id);

  // Función para cargar datos de etiqueta
  async function loadTagData(id) {
    try {
      const response = await fetch(`${backendAPI}tag/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success && data.tag) {
        document.getElementById('edit-tag-name').value = data.tag.name;
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Manejar el envío del formulario
  document
    .getElementById('edit-tag-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      const id = localStorage.getItem('id');

      document.getElementById('edit-tag-loading').style.display = 'block';

      try {
        const formData = new FormData();
        formData.append(
          'name',
          document.getElementById('edit-tag-name').value
        );

        const response = await fetch(`${backendAPI}edit-tag/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          document.getElementById('edit-tag-success-message').style.display =
            'block';
          setTimeout(() => {
            document.getElementById(
              'edit-tag-success-message'
            ).style.display = 'none';
          }, 5000);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        document.getElementById('edit-tag-loading').style.display = 'none';
      }
    });
}

editTagForm();

