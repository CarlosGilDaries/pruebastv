async function editContentForm() {
	let id = localStorage.getItem('id');
	const token = localStorage.getItem('auth_token');
	const backendAPI = 'https://pruebastv.kmc.es/api/';

	loadContentData(id);
  // Escuchar cuando se muestra el formulario
  document.getElementById('edit-content').addEventListener('show', function () {
    id = localStorage.getItem('id');
    loadContentData(id);
  });

  async function loadContentData(id) {
    try {
      const response = await fetch(backendAPI + `edit-view-content/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const plansResponse = await fetch(backendAPI + 'plans');
      const genderResponse = await fetch(backendAPI + 'genders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const content = data.data.movie; 
      const plansData = await plansResponse.json();
      const genderData = await genderResponse.json();
      const plans = plansData.plans;
      const genders = genderData.genders;

      let currentPlansId = [];
      content.plans.forEach((plan) => {
        currentPlansId.push(plan.id);
      });
     const plansContainer = document.getElementById(
       'edit-content-plans-container'
     );
     const selectGender = document.getElementById('edit-content-gender_id');
      let plansContainerTextContent = '';

     plans.forEach((plan) => {
       plansContainerTextContent += `
                                    <label class="checkbox-container">
                                      <input type="checkbox" name="plans[${plan.id}][id]" value="${plan.id}" id="edit-content-plan-${plan.id}" class="plan-checkbox">
                                      <span class="checkmark"></span>
                                        <p>${plan.name}</p>
                                    </label>
                                    `;
     });
     plansContainer.innerHTML = plansContainerTextContent;

     genders.forEach((gender) => {
       let option = document.createElement('option');
       option.value = gender.id;
       option.innerHTML = gender.name;
       selectGender.appendChild(option);
     });

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
     setupFileInput('cover', 'cover-name', 'cover-label-text');
     setupFileInput('trailer', 'trailer-name', 'trailer-label-text');

      document.getElementById('edit-content-title').value = content.title;
      CKEDITOR.instances.edit_content_tagline.setData(content.tagline);
      CKEDITOR.instances.edit_content_overview.setData(content.overview);

      let checkboxPlans = document.querySelectorAll(
        '#edit-content-form .plan-checkbox'
      );

      checkboxPlans.forEach((chbox) => {
        chbox.checked = currentPlansId.includes(Number(chbox.value));
      });

      document.getElementById('edit-content-gender_id').value =
        content.gender_id;
      document.getElementById('edit-content-pay_per_view').checked =
        content.pay_per_view == 1;
      document.getElementById('edit-content-pay_per_view_price').value =
        content.pay_per_view_price;
      document.getElementById('edit-content-start_time').value =
        content.start_time;
      document.getElementById('edit-content-end_time').value = content.end_time;
    } catch (error) {
      console.error('Error cargando contenido:', error);
    }
  }

  document
    .getElementById('edit-content-pay_per_view')
    .addEventListener('change', function () {
      const payPerViewFields = document.getElementById(
        'edit-content-pay_per_view_fields'
      );
      if (this.checked) {
        payPerViewFields.classList.remove('hidden');
      } else {
        payPerViewFields.classList.add('hidden');
        document.getElementById('edit-content-pay_per_view_price').value = '';
      }
    });

  document
    .getElementById('edit-content-form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      document.getElementById('edit-content-loading').style.display = 'block';

      const formData = new FormData();
      formData.append(
        'title',
        document.getElementById('edit-content-title').value
      );
      formData.append(
        'gender_id',
        document.getElementById('edit-content-gender_id').value
      );
      formData.append(
        'tagline',
        CKEDITOR.instances.edit_content_tagline.getData()
      );
      formData.append(
        'overview',
        CKEDITOR.instances.edit_content_overview.getData()
      );
      formData.append(
        'pay_per_view',
        document.getElementById('edit-content-pay_per_view').checked ? '1' : '0'
      );

      if (document.getElementById('edit-content-pay_per_view').value) {
        formData.append(
          'pay_per_view_price',
          document.getElementById('edit-content-pay_per_view_price').value
        );
      }

      if (document.getElementById('edit-content-start_time').value) {
        formData.append(
          'start_time',
          document.getElementById('edit-content-start_time').value
        );
      }

      if (document.getElementById('edit-content-end_time').value) {
        formData.append(
          'end_time',
          document.getElementById('edit-content-end_time').value
        );
      }

      const coverInput = document.getElementById('edit-content-cover');
      if (coverInput && coverInput.files.length > 0) {
        formData.append('cover', coverInput.files[0]);
      } else {
        formData.append('cover', ''); // Envía un valor vacío si no hay archivo
      }

      if (
        document.getElementById('edit-content-trailer') &&
        document.getElementById('edit-content-trailer').files[0]
      ) {
        formData.append(
          'edit-content-trailer',
          document.getElementById('edit-content-trailer').files[0]
        );
      }

      const checkboxes = document.querySelectorAll(
        '#edit-content-form .plan-checkbox'
      );
      let atLeastOneChecked = false;

      checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          formData.append('plans[]', checkbox.value);
          atLeastOneChecked = true;
        }
      });

      if (!atLeastOneChecked) {
        document.getElementById('edit-content-loading').style.display = 'none';
        alert('Selecciona al menos un plan');
        return;
      }

      try {
        const editResponse = await fetch(
          backendAPI + `update-content/${id}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        const data = await editResponse.json();

        if (data.success) {
          // Mostrar mensaje de éxito
          document.getElementById(
            'edit-content-success-message'
          ).style.display = 'block';

          setTimeout(() => {
            document.getElementById(
              'edit-content-success-message'
            ).style.display = 'none';
          }, 5000);

          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          console.log('Error al editar:', data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        document.getElementById('edit-content-loading').style.display = 'none';
      }
    });
}

editContentForm();


