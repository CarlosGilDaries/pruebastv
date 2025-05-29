async function editContentForm() {
  let id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = 'https://pruebastv.kmc.es/api/';

  loadContentData(id);

  // Manejar el checkbox para cambiar archivo de contenido
  const changeContentCheckbox = document.getElementById('change-content-file');
  changeContentCheckbox.addEventListener('change', function () {
    const shouldChange = this.checked;
    document
      .getElementById('type-content')
      .classList.toggle('hidden', !shouldChange);

    // Ocultar todos los campos de archivos si el checkbox no está marcado
    if (!shouldChange) {
      document.getElementById('single-content').classList.add('hidden');
      document.getElementById('hls-content').classList.add('hidden');
      document.getElementById('external-content').classList.add('hidden');
    } else {
      // Mostrar los campos según el tipo seleccionado
      const type = document.getElementById('type').value;
      if (type) {
        toggleContentFiles(type);
      }
    }
  });

  // Manejar cambio de tipo de contenido
  document.getElementById('type').addEventListener('change', function () {
    if (changeContentCheckbox.checked) {
      toggleContentFiles(this.value);
    }
  });

  // Función para mostrar/ocultar campos de archivos según el tipo
  function toggleContentFiles(type) {
    const singleContent = document.getElementById('single-content');
    const hlsContent = document.getElementById('hls-content');
    const externalUrl = document.getElementById('external-content');

    singleContent.classList.add('hidden');
    hlsContent.classList.add('hidden');
    externalUrl.classList.add('hidden');

    if (type === 'video/mp4' || type === 'audio/mpeg') {
      singleContent.classList.remove('hidden');
    } else if (type === 'application/vnd.apple.mpegurl') {
      hlsContent.classList.remove('hidden');
    } else {
      externalUrl.classList.remove('hidden');
    }
  }

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
      const categoryResponse = await fetch(backendAPI + 'categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const content = data.data.movie;
      const plansData = await plansResponse.json();
      const genderData = await genderResponse.json();
      const categoryData = await categoryResponse.json();
      const plans = plansData.plans;
      const genders = genderData.genders;
      const categories = categoryData.categories;

      let currentPlansId = [];
      content.plans.forEach((plan) => {
        currentPlansId.push(plan.id);
      });
      let currentCategoriesId = [];
      content.categories.forEach((category) => {
        currentCategoriesId.push(category.id);
      });

      const plansContainer = document.getElementById(
        'edit-content-plans-container'
      );
      const categoriesContainer = document.getElementById(
        'edit-content-categories-container'
      );
      const selectGender = document.getElementById('edit-content-gender_id');
      let plansContainerTextContent = '';
      let categoriesContainerTextContent = '';

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

      categories.forEach((category) => {
        categoriesContainerTextContent += `
                                     <label class="checkbox-container">
                                       <input type="checkbox" name="categories[${category.id}][id]" value="${category.id}" id="edit-content-category-${category.id}" class="category-checkbox">
                                       <span class="checkmark"></span>
                                         <p>${category.name}</p>
                                     </label>
                                     `;
      });
      categoriesContainer.innerHTML = categoriesContainerTextContent;

      genders.forEach((gender) => {
        let option = document.createElement('option');
        option.value = gender.id;
        option.innerHTML = gender.name;
        selectGender.appendChild(option);
      });

      // Configurar inputs de archivo para mostrar nombre
      const setupFileInput = (inputId, nameId, labelId, currentPath = null) => {
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
            const fileName =
              e.target.files[0]?.name || 'Ningún archivo seleccionado';
            if (nameElement) nameElement.textContent = fileName;
            if (labelElement) labelElement.textContent = fileName;
          });
        }
      };

      setupFileInput(
        'edit-content-cover',
        'edit-content-cover-name',
        'edit-content-cover-label-text',
        content.cover
      );
      setupFileInput(
        'edit-content-trailer',
        'edit-content-trailer-name',
        'edit-content-trailer-label-text',
        content.trailer
      );
      setupFileInput('content', 'content-name', 'content-label-text');
      setupFileInput('m3u8', 'm3u8-name', 'm3u8-label-text');
      setupFileInput('ts1', 'ts1-name', 'ts1-label-text');
      setupFileInput('ts2', 'ts2-name', 'ts2-label-text');
      setupFileInput('ts3', 'ts3-name', 'ts3-label-text');

      document.getElementById('edit-content-title').value = content.title;

      if (
        (content.type =
          !'video/mp4' ||
          content.type != 'audio/mpeg' ||
          content.type != 'application/vnd.apple.mpegurl')
      ) {
        document.getElementById('external_url').value = content.url;
      }

      CKEDITOR.instances.edit_content_tagline.setData(content.tagline);
      CKEDITOR.instances.edit_content_overview.setData(content.overview);

      let checkboxPlans = document.querySelectorAll(
        '#edit-content-form .plan-checkbox'
      );

      let checkboxCategories = document.querySelectorAll(
        '#edit-content-form .category-checkbox'
      );

      checkboxPlans.forEach((chbox) => {
        chbox.checked = currentPlansId.includes(Number(chbox.value));
      });
      checkboxCategories.forEach((chbox) => {
        chbox.checked = currentCategoriesId.includes(Number(chbox.value));
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

      const shouldChangeContent = document.getElementById(
        'change-content-file'
      ).checked;

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
          'trailer',
          document.getElementById('edit-content-trailer').files[0]
        );
      }

      // Solo procesar archivos de contenido si el checkbox está marcado
      if (shouldChangeContent) {
        const type = document.getElementById('type').value;
        formData.append('type', type);
        if (type === 'video/mp4' || type === 'audio/mpeg') {
          const contentInput = document.getElementById('content');
          if (contentInput.files.length > 0) {
            formData.append('content', contentInput.files[0]);
          }
        } else if (type === 'application/vnd.apple.mpegurl') {
          const m3u8Input = document.getElementById('m3u8');
          const ts1Input = document.getElementById('ts1');
          const ts2Input = document.getElementById('ts2');
          const ts3Input = document.getElementById('ts3');

          if (m3u8Input.files.length > 0)
            formData.append('m3u8', m3u8Input.files[0]);
          if (ts1Input.files.length > 0)
            formData.append('ts1', ts1Input.files[0]);
          if (ts2Input.files.length > 0)
            formData.append('ts2', ts2Input.files[0]);
          if (ts3Input.files.length > 0)
            formData.append('ts3', ts3Input.files[0]);
        } else if (type != null && type != '') {
          formData.append(
            'external_url',
            document.getElementById('external_url').value
          );
        }
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

      const categoryCheckboxes = document.querySelectorAll(
        '#edit-content-form .category-checkbox'
      );
      let atLeastOneCategoryChecked = false;

      categoryCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          formData.append('categories[]', checkbox.value);
          atLeastOneCategoryChecked = true;
        }
      });

      if (!atLeastOneCategoryChecked) {
        document.getElementById('edit-content-loading').style.display = 'none';
        alert('Selecciona al menos una categoría');
        return;
      }

      try {
        const editResponse = await fetch(backendAPI + `update-content/${id}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
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
