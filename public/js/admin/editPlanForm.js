async function editPlanForm() {
	let id = localStorage.getItem('id');
	const token = localStorage.getItem('auth_token');
	const backendAPI = 'https://pruebastv.kmc.es/api/';
	
	id = localStorage.getItem('id');
    loadPlanData(id);
    // Escuchar cuando se muestra el formulario
    document
      .getElementById('edit-plan')
      .addEventListener('show', function () {
        id = localStorage.getItem('id');
        loadPlanData(id);
      });

	async function loadPlanData(id) {
	  try {
		const response = await fetch(backendAPI + `plan/${id}`, {
		  headers: {
			Authorization: `Bearer ${token}`,
		  },
		});
		const data = await response.json();
		const plan = data.plan;

		document.getElementById('edit-plan-name').value = plan.name;
		document.getElementById('edit-plan-price').value = plan.price;
		document.getElementById('edit-plan-max-devices').value = plan.max_devices;
		document.getElementById('edit-plan-max-streams').value = plan.max_streams;
		document.getElementById('edit-plan-ads').value = plan.ads;
	  } catch (error) {
		console.error('Error cargando anuncio:', error);
	  }
	}

    document
      .getElementById('edit-plan-form')
      .addEventListener('submit', async function (e) {
        e.preventDefault();

        document.getElementById('edit-plan-loading').style.display = 'block';

        const formData = new FormData();
        formData.append(
          'name',
          document.getElementById('edit-plan-name').value
        );
        formData.append(
          'price',
          document.getElementById('edit-plan-price').value
        );
        formData.append(
          'max_devices',
          document.getElementById('edit-plan-max-devices').value
        );
        formData.append(
          'max_streams',
          document.getElementById('edit-plan-max-streams').value
        );
        formData.append('ads', document.getElementById('edit-plan-ads').value);

        try {
          const editResponse = await fetch(backendAPI + `edit-plan/${id}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
          const data = await editResponse.json();

          if (data.success) {
            // Mostrar mensaje de éxito
            document.getElementById('edit-plan-success-message').style.display =
              'block';

            setTimeout(() => {
              document.getElementById('edit-plan-success-message').style.display =
                'none';
            }, 5000);

            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            console.log('Error al editar:', data.message);
          }
        } catch (error) {
          console.log(error);
        } finally {
          document.getElementById('edit-plan-loading').style.display = 'none';
        }
      });
  }

editPlanForm();

