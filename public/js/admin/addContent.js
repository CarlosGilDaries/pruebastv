import { validateAddForm } from "../modules/validateAddForm.js";

async function initContent() {
  const backendAPI = '/api/';
  const authToken = localStorage.getItem('auth_token');

  setupPlansGendersCategoriesTags(authToken);

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
  setupFileInput('tall-cover', 'tall-cover-name', 'tall-cover-label-text');
  setupFileInput('content', 'content-name', 'content-label-text');
  setupFileInput('m3u8', 'm3u8-name', 'm3u8-label-text');
  setupFileInput('ts1', 'ts1-name', 'ts1-label-text');
  setupFileInput('ts2', 'ts2-name', 'ts2-label-text');
  setupFileInput('ts3', 'ts3-name', 'ts3-label-text');
  setupFileInput('trailer', 'trailer-name', 'trailer-label-text');

  // Toggle campos Pay Per View
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

  // Mostrar/ocultar campos según tipo de contenido
  document.getElementById('type').addEventListener('change', function () {
    const type = this.value;
    const singleContent = document.getElementById('single-content');
    const hlsContent = document.getElementById('hls-content');
    const externalContent = document.getElementById('external-content');

    singleContent.classList.add('hidden');
    hlsContent.classList.add('hidden');
    externalContent.classList.add('hidden');

    document.getElementById('content').required = false;
    document.getElementById('m3u8').required = false;
    document.getElementById('external_url').required = false;

    if (type === 'application/vnd.apple.mpegurl') {
      hlsContent.classList.remove('hidden');
      document.getElementById('m3u8').required = true;
    } else if (
      type === 'iframe' ||
      type === 'url_mp4' ||
      type === 'url_hls' ||
      type === 'video/youtube' ||
      type === 'vimeo' ||
      type == 'url_mp3' ||
      type == 'stream'
    ) {
      externalContent.classList.remove('hidden');
      document.getElementById('external_url').required = true;
    } else {
      singleContent.classList.remove('hidden');
      document.getElementById('content').required = true;
    }
  });


  // Manejar envío del formulario
  document
    .getElementById('form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validar antes de enviar
      if (!validateAddForm()) {
        return;
      }

      // Resetear mensajes de error
      document
        .querySelectorAll('#form .error-message')
        .forEach((el) => (el.textContent = ''));
      document.getElementById('success-message').style.display = 'none';

      // Mostrar loader
      document.getElementById('loading').style.display = 'block';

      if (!authToken) {
        window.location.href = '/login';
        return;
      }

      const formData = new FormData();
      formData.append('title', document.getElementById('title').value);
      formData.append('type', document.getElementById('type').value);
      formData.append('gender_id', document.getElementById('gender_id').value);
      formData.append('tagline', CKEDITOR.instances.tagline.getData());
      formData.append('overview', CKEDITOR.instances.overview.getData());
      formData.append(
        'pay_per_view',
        document.getElementById('pay_per_view').checked ? '1' : '0'
      );

      if (document.getElementById('pay_per_view').checked) {
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

      if (document.getElementById('duration').value) {
        formData.append('duration', document.getElementById('duration').value);
      }

      if (document.getElementById('cover')) {
        formData.append('cover', document.getElementById('cover').files[0]);
      }

      if (document.getElementById('tall-cover')) {
        formData.append('tall_cover', document.getElementById('tall-cover').files[0]);
      }

      if (
        document.getElementById('trailer') &&
        document.getElementById('trailer').files[0]
      ) {
        formData.append('trailer', document.getElementById('trailer').files[0]);
      }

      const type = document.getElementById('type').value;
      if (type === 'application/vnd.apple.mpegurl') {
        formData.append('m3u8', document.getElementById('m3u8').files[0]);
        formData.append('ts1', document.getElementById('ts1').files[0]);
        formData.append('ts2', document.getElementById('ts2').files[0]);
      } else if (
        type === 'url_mp4' ||
        type === 'url_hls' ||
        type === 'stream' ||
        type == 'url_mp3'
      ) {
        formData.append(
          'external_url',
          document.getElementById('external_url').value
        );
      } else {
        formData.append('content', document.getElementById('content').files[0]);
      }

      const planCheckboxes = document.querySelectorAll(
        '#form .plan-checkbox'
      );

      planCheckboxes.forEach((checkbox) => {
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
      
      let permission;
      if (type == 'video/mp4' || type == 'application/vnd.apple.mpegurl' || type == 'audio/mpeg') {
        permission = 'local';
      } else if (type == 'stream') {
        permission = 'streams';
      } else {
        permission = 'external';
      }

        try {
          const response = await fetch(`/api/add-content/${permission}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            // Mostrar errores específicos si existen
            if (data.errors) {
              Object.entries(data.errors).forEach(([field, messages]) => {
                const errorElement = document.getElementById(`${field}-error`);
                if (errorElement) {
                  errorElement.textContent = messages.join(', ');
                }
              });
            } else {
              throw new Error(data.error || 'Error al subir el contenido');
            }
            return;
          }

          // Mostrar mensaje de éxito
          document.getElementById('success-message').style.display = 'block';
          document.getElementById('success-message').textContent = `${
            data.message
          } - ${data.movie?.title || 'Contenido subido'}`;

          setTimeout(() => {
            document.getElementById('success-message').style.display = 'none';
          }, 5000);

          // Resetear formulario
          document.getElementById('form').reset();
          document
            .querySelectorAll('#form .file-name')
            .forEach((el) => (el.textContent = ''));
          document
            .querySelectorAll('#form .file-input-label span')
            .forEach((el) => {
              el.textContent = 'Seleccionar archivo...';
            });
          CKEDITOR.instances.tagline.setData('');
          CKEDITOR.instances.overview.setData('');
          document
            .getElementById('pay_per_view_fields')
            .classList.add('hidden');
        } catch (error) {
          console.error('Error:', error);
          alert('Error al subir el contenido: ' + error.message);
        } finally {
          document.getElementById('loading').style.display = 'none';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

initContent();

async function setupPlansGendersCategoriesTags(authToken) {
	  try {
      const plansContainer = document.getElementById('plans-container');
      const selectGender = document.getElementById('gender_id');
      const categoriesContainer = document.getElementById('categories-container');
      const tagsContainer = document.getElementById('tags-container');
      let plansContainerTextContent = '';
      let categoriesContainerTextContent = '';
      let tagsContainerTextContent = '';
      const response = await fetch('/api/plans');
      const tagsResponse = await fetch('/api/tags');
      const genderResponse = await fetch('/api/genders', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const categoryResponse = await fetch('/api/dropdown-categories-menu', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      const genderData = await genderResponse.json();
      const categoryData = await categoryResponse.json();
      const tagsData = await tagsResponse.json();
      const plans = data.plans;
      const genders = genderData.genders;
      const categories = categoryData.categories;
      const tags = tagsData.tags;

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
    } catch (error) {
      console.log(error);
    }
}
  
