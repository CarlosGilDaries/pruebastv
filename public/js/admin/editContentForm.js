import { validateAddForm } from '../modules/validateAddForm.js';

async function editContentForm() {
  let id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';
  const permission = document.getElementById('type-content').getAttribute('data-type');;

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
      const response = await fetch(
        `/api/edit-view-content/${id}/${permission}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const plansResponse = await fetch('/api/plans');
      const tagsResponse = await fetch('/api/tags');
      const genderResponse = await fetch('/api/genders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const categoryResponse = await fetch('/api/dropdown-categories-menu', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const content = data.data.movie;
      const plansData = await plansResponse.json();
      const genderData = await genderResponse.json();
      const categoryData = await categoryResponse.json();
      const tagsData = await tagsResponse.json();
      const tags = tagsData.tags;
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
      let currentTagsId = [];
      content.tags.forEach((tag) => {
        currentTagsId.push(tag.id);
      });

      const plansContainer = document.getElementById('plans-container');
      const categoriesContainer = document.getElementById(
        'categories-container'
      );
      const tagsContainer = document.getElementById(
        'tags-container'
      );
      const selectGender = document.getElementById('gender_id');
      let plansContainerTextContent = '';
      let categoriesContainerTextContent = '';
      let tagsContainerTextContent = '';

      plans.forEach((plan) => {
        plansContainerTextContent += `
                                    <label class="checkbox-container">
                                      <input type="checkbox" name="plans[${plan.id}][id]" value="${plan.id}" id="plan-${plan.id}" class="plan-checkbox">
                                      <span class="checkmark"></span>
                                        <p>${plan.name}</p>
                                    </label>
                                    `;
      });
      plansContainer.innerHTML = plansContainerTextContent;

      categories.forEach((category) => {
        categoriesContainerTextContent += `
                                     <label class="checkbox-container">
                                       <input type="checkbox" name="categories[${category.id}][id]" value="${category.id}" id="category-${category.id}" class="category-checkbox">
                                       <span class="checkmark"></span>
                                         <p>${category.name}</p>
                                     </label>
                                     `;
      });
      categoriesContainer.innerHTML = categoriesContainerTextContent;

      tags.forEach((tag) => {
        tagsContainerTextContent += `
                                     <label class="checkbox-container">
                                       <input type="checkbox" name="tags[${tag.id}][id]" value="${tag.id}" id="tag-${tag.id}" class="tag-checkbox">
                                       <span class="checkmark"></span>
                                         <p>${tag.name}</p>
                                     </label>
                                     `;
      });
      tagsContainer.innerHTML = tagsContainerTextContent;

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
            // Verificar primero si hay archivos seleccionados
            const fileName =
              e.target.files && e.target.files.length > 0
                ? e.target.files[0].name
                : 'Ningún archivo seleccionado';

            if (nameElement) nameElement.textContent = fileName;
            if (labelElement) labelElement.textContent = fileName;
          });
        }
      };

      setupFileInput('cover', 'cover-name', 'cover-label-text', content.cover);
      setupFileInput(
        'tall-cover',
        'tall-cover-name',
        'tall-cover-label-text',
        content.tall_cover
      );
      setupFileInput(
        'trailer',
        'trailer-name',
        'trailer-label-text',
        content.trailer
      );
      setupFileInput('content', 'content-name', 'content-label-text');
      setupFileInput('m3u8', 'm3u8-name', 'm3u8-label-text');
      setupFileInput('ts1', 'ts1-name', 'ts1-label-text');
      setupFileInput('ts2', 'ts2-name', 'ts2-label-text');
      setupFileInput('ts3', 'ts3-name', 'ts3-label-text');

      document.getElementById('title').value = content.title;
      document.getElementById('duration').value = content.duration;

      if (
        (content.type != 'video/mp4' ||
          content.type != 'audio/mpeg' ||
          content.type != 'application/vnd.apple.mpegurl')
      ) {
        document.getElementById('external_url').value = content.url;
      }

      CKEDITOR.instances.tagline.setData(content.tagline);
      CKEDITOR.instances.overview.setData(content.overview);

      let checkboxPlans = document.querySelectorAll('#form .plan-checkbox');

      let checkboxCategories = document.querySelectorAll(
        '#form .category-checkbox'
      );

      let checkboxTags = document.querySelectorAll(
        '#form .tag-checkbox'
      );

      checkboxPlans.forEach((chbox) => {
        chbox.checked = currentPlansId.includes(Number(chbox.value));
      });
      checkboxCategories.forEach((chbox) => {
        chbox.checked = currentCategoriesId.includes(Number(chbox.value));
      });
      checkboxTags.forEach((chbox) => {
        chbox.checked = currentTagsId.includes(Number(chbox.value));
      });

      document.getElementById('gender_id').value = content.gender_id;
      document.getElementById('pay_per_view').checked =
        content.pay_per_view == 1;
      document.getElementById('pay_per_view_price').value =
        content.pay_per_view_price;
      document.getElementById('start_time').value = content.start_time;
      document.getElementById('end_time').value = content.end_time;
    } catch (error) {
      console.error('Error cargando contenido:', error);
    }
  }

  document
    .getElementById('pay_per_view')
    .addEventListener('change', function () {
      const payPerViewFields = document.getElementById('pay_per_view_fields');
      if (this.checked) {
        payPerViewFields.classList.remove('hidden');
      } else {
        payPerViewFields.classList.add('hidden');
        document.getElementById('pay_per_view_price').value = '';
      }
    });

  document
    .getElementById('form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validar antes de enviar
      if (!validateAddForm()) {
        return;
      }

      const shouldChangeContent = document.getElementById(
        'change-content-file'
      ).checked;

      document.getElementById('loading').style.display = 'block';

      const formData = new FormData();
      formData.append('title', document.getElementById('title').value);
      formData.append('duration', document.getElementById('duration').value);
      formData.append('gender_id', document.getElementById('gender_id').value);
      formData.append(
        'tagline',
        CKEDITOR.instances.tagline.getData()
      );
      formData.append(
        'overview',
        CKEDITOR.instances.overview.getData()
      );
      formData.append(
        'pay_per_view',
        document.getElementById('pay_per_view').checked ? '1' : '0'
      );

      if (document.getElementById('pay_per_view').value) {
        formData.append(
          'pay_per_view_price',
          document.getElementById('pay_per_view_price').value
        );
      }

      if (document.getElementById('start_time').value) {
        formData.append(
          'start_time',
          document.getElementById('start_time').value
        );
      }

      if (document.getElementById('end_time').value) {
        formData.append('end_time', document.getElementById('end_time').value);
      }

      const coverInput = document.getElementById('cover');
      if (coverInput && coverInput.files.length > 0) {
        formData.append('cover', coverInput.files[0]);
      } else {
        formData.append('cover', ''); // Envía un valor vacío si no hay archivo
      }

      const tallCoverInput = document.getElementById('tall-cover');
      if (tallCoverInput && tallCoverInput.files.length > 0) {
        formData.append('tall_cover', tallCoverInput.files[0]);
      } else {
        formData.append('tall_cover', ''); // Envía un valor vacío si no hay archivo
      }

      if (
        document.getElementById('trailer') &&
        document.getElementById('trailer').files[0]
      ) {
        formData.append('trailer', document.getElementById('trailer').files[0]);
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

      const checkboxes = document.querySelectorAll('#form .plan-checkbox');

      checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          formData.append('plans[]', checkbox.value);
        }
      });

      const categoryCheckboxes = document.querySelectorAll(
        '#form .category-checkbox'
      );

      categoryCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          formData.append('categories[]', checkbox.value);
        }
      });

      const tagCheckboxes = document.querySelectorAll(
        '#form .tag-checkbox'
      );

      tagCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          formData.append('tags[]', checkbox.value);
        }
      });

      try {
        const editResponse = await fetch(
          `/api/update-content/${id}/${permission}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        const data = await editResponse.json();
        console.log(data);

        if (data.success) {
          // Mostrar mensaje de éxito
          document.getElementById('success-message').style.display = 'block';

          setTimeout(() => {
            document.getElementById('success-message').style.display = 'none';
          }, 5000);

          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          console.log('Error al editar:', data.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        document.getElementById('loading').style.display = 'none';
      }
    });
}

editContentForm();
