async function editAdsForm() {
  let id;
  const token = localStorage.getItem('auth_token');
  const backendAPI = 'https://pruebastv.kmc.es/api/';

	id = localStorage.getItem('id');
	loadAdData(id);
	// Escuchar cuando se muestra el formulario
	document
		.getElementById('edit-ad')
		.addEventListener('show', function () {
		id = localStorage.getItem('id');
		loadAdData(id);
	});
	
  document
    .getElementById('edit-ad-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      document.getElementById('edit-ad-loading').style.display = 'block';

      const formData = new FormData();
      formData.append('title', document.getElementById('edit-ad-title').value);
      formData.append('brand', document.getElementById('edit-ad-brand').value);

      try {
        const editResponse = await fetch(backendAPI + `update-ad/${id}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await editResponse.json();

        if (data.success) {
          // Mostrar mensaje de éxito
          document.getElementById('edit-ad-success-message').style.display =
            'block';

          setTimeout(() => {
            document.getElementById('edit-ad-success-message').style.display =
              'none';
          }, 5000);

          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          console.log('Error al editar:', data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        document.getElementById('edit-ad-loading').style.display = 'none';
      }
    });

  async function loadAdData(id) {
    try {
      const response = await fetch(backendAPI + `edit-view-ad/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const ad = data.data;

      document.getElementById('edit-ad-title').value = ad.title;
      document.getElementById('edit-ad-brand').value = ad.brand;
    } catch (error) {
      console.error('Error cargando anuncio:', error);
    }
  }
}

editAdsForm();
