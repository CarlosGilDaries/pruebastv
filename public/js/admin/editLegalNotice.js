async function editLegalNoticeForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const select = document.getElementById('order');

  loadLegalNoticeData(id);

  async function loadLegalNoticeData(id) {
    try {
      const response = await fetch(`${backendAPI}legal-notice/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        document.getElementById('edit-title').value = data.legalNotice.title;
        CKEDITOR.instances.text.setData(
          data.legalNotice.text
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

editLegalNoticeForm();
