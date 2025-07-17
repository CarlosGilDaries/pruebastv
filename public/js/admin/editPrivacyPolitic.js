async function editPrivacyPoliticForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const select = document.getElementById('order');

  loadPrivacyPoliticData(id);

  async function loadPrivacyPoliticData(id) {
    try {
      const response = await fetch(`${backendAPI}legal-notice/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        document.getElementById('edit-title').value = data.privacyPolitic.title;
        CKEDITOR.instances.text.setData(
          data.privacyPolitic.text
        );
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Manejar el envío del formulario
  document
    .getElementById('legal-notice-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      const id = localStorage.getItem('id');

      document.getElementById('loading').style.display = 'block';

      try {
        const formData = new FormData();
        formData.append('title', document.getElementById('edit-title').value);
        formData.append(
          'text',
          CKEDITOR.instances.text.getData()
        );
        const response = await fetch(`${backendAPI}edit-legal-notice/${id}`, {
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

editPrivacyPoliticForm();
