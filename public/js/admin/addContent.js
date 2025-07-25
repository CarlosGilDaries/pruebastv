import { validateAddForm } from '../modules/validateAddForm.js';

async function initContent() {
  const backendAPI = '/api/';
  const authToken = localStorage.getItem('auth_token');

  setupPlansGendersCategoriesTags(authToken);

  // Mostrar nombre de archivos seleccionados
  const setupFileInput = (inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('change', function (e) {
        const fileName =
          e.target.files[0]?.name || 'Ningún archivo seleccionado';
        // Mostrar el nombre del archivo en el input (Bootstrap lo hace automáticamente)
      });
    }
  };

  setupFileInput('cover');
  setupFileInput('tall-cover');
  setupFileInput('content');
  setupFileInput('m3u8');
  setupFileInput('ts1');
  setupFileInput('ts2');
  setupFileInput('ts3');
  setupFileInput('trailer');

  // Toggle campos Pay Per View
  document
    .getElementById('pay_per_view')
    .addEventListener('change', function () {
      const payPerViewFields = document.getElementById('pay_per_view_fields');
      if (this.checked) {
        payPerViewFields.classList.remove('d-none');
      } else {
        payPerViewFields.classList.add('d-none');
        document.getElementById('pay_per_view_price').value = '';
      }
    });

  // Toggle campos Alquiler
  document.getElementById('rent').addEventListener('change', function () {
    const RentFields = document.getElementById('rent_fields');
    if (this.checked) {
      RentFields.classList.remove('d-none');
    } else {
      RentFields.classList.add('d-none');
      document.getElementById('rent_price').value = '';
      document.getElementById('rent_days').value = '';
    }
  });

  // Mostrar/ocultar campos según tipo de contenido
  document.getElementById('type').addEventListener('change', function () {
    const type = this.value;
    const singleContent = document.getElementById('single-content');
    const hlsContent = document.getElementById('hls-content');
    const externalContent = document.getElementById('external-content');

    singleContent.classList.add('d-none');
    hlsContent.classList.add('d-none');
    externalContent.classList.add('d-none');

    document.getElementById('content').required = false;
    document.getElementById('m3u8').required = false;
    document.getElementById('external_url').required = false;

    if (type === 'application/vnd.apple.mpegurl') {
      hlsContent.classList.remove('d-none');
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
      externalContent.classList.remove('d-none');
      document.getElementById('external_url').required = true;
    } else {
      singleContent.classList.remove('d-none');
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
        .querySelectorAll('#form .invalid-feedback')
        .forEach((el) => (el.textContent = ''));
      document.getElementById('success-message').classList.add('d-none');

      // Mostrar loader
      document.getElementById('loading').classList.remove('d-none');

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

      formData.append(
        'rent',
        document.getElementById('rent').checked ? '1' : '0'
      );

      if (document.getElementById('rent').checked) {
        formData.append(
          'rent_price',
          document.getElementById('rent_price').value
        );
        formData.append(
          'rent_days',
          document.getElementById('rent_days').value
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
        formData.append(
          'tall_cover',
          document.getElementById('tall-cover').files[0]
        );
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

      // Obtener checkboxes seleccionados
      const planCheckboxes = document.querySelectorAll(
        '#plans-container input[type="checkbox"]:checked'
      );
      planCheckboxes.forEach((checkbox) => {
        formData.append('plans[]', checkbox.value);
      });

      const categoryCheckboxes = document.querySelectorAll(
        '#categories-container input[type="checkbox"]:checked'
      );
      categoryCheckboxes.forEach((checkbox) => {
        formData.append('categories[]', checkbox.value);
      });

      const tagCheckboxes = document.querySelectorAll(
        '#tags-container input[type="checkbox"]:checked'
      );
      tagCheckboxes.forEach((checkbox) => {
        formData.append('tags[]', checkbox.value);
      });

      let permission;
      if (
        type == 'video/mp4' ||
        type == 'application/vnd.apple.mpegurl' ||
        type == 'audio/mpeg'
      ) {
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
                errorElement.style.display = 'block';
              }
            });
          } else {
            throw new Error(data.error || 'Error al subir el contenido');
          }
          return;
        }

        // Mostrar mensaje de éxito
        const successMessage = document.getElementById('success-message');
        successMessage.classList.remove('d-none');
        successMessage.textContent = `${data.message} - ${
          data.movie?.title || 'Contenido subido'
        }`;

        setTimeout(() => {
          successMessage.classList.add('d-none');
        }, 5000);

        // Resetear formulario
        document.getElementById('form').reset();
        CKEDITOR.instances.tagline.setData('');
        CKEDITOR.instances.overview.setData('');
        document.getElementById('pay_per_view_fields').classList.add('d-none');
        document.getElementById('rent_fields').classList.add('d-none');

        // Resetear checkboxes
        document
          .querySelectorAll('#plans-container input[type="checkbox"]')
          .forEach((cb) => (cb.checked = false));
        document
          .querySelectorAll('#categories-container input[type="checkbox"]')
          .forEach((cb) => (cb.checked = false));
        document
          .querySelectorAll('#tags-container input[type="checkbox"]')
          .forEach((cb) => (cb.checked = false));
      } catch (error) {
        console.error('Error:', error);
        alert('Error al subir el contenido: ' + error.message);
      } finally {
        document.getElementById('loading').classList.add('d-none');
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

    // Llenar planes
    plans.forEach((plan) => {
      const div = document.createElement('div');
      div.className = 'form-check';

      const input = document.createElement('input');
      input.className = 'form-check-input';
      input.type = 'checkbox';
      input.value = plan.id;
      input.id = `plan-${plan.id}`;
      input.name = 'plans[]';

      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.htmlFor = `plan-${plan.id}`;
      label.textContent = plan.name;

      div.appendChild(input);
      div.appendChild(label);
      plansContainer.appendChild(div);
    });

    // Llenar categorías
    categories.forEach((category) => {
      const div = document.createElement('div');
      div.className = 'form-check';

      const input = document.createElement('input');
      input.className = 'form-check-input';
      input.type = 'checkbox';
      input.value = category.id;
      input.id = `category-${category.id}`;
      input.name = 'categories[]';

      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.htmlFor = `category-${category.id}`;
      label.textContent = category.name;

      div.appendChild(input);
      div.appendChild(label);
      categoriesContainer.appendChild(div);
    });

    // Llenar etiquetas
    tags.forEach((tag) => {
      const div = document.createElement('div');
      div.className = 'form-check';

      const input = document.createElement('input');
      input.className = 'form-check-input';
      input.type = 'checkbox';
      input.value = tag.id;
      input.id = `tag-${tag.id}`;
      input.name = 'tags[]';

      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.htmlFor = `tag-${tag.id}`;
      label.textContent = tag.name;

      div.appendChild(input);
      div.appendChild(label);
      tagsContainer.appendChild(div);
    });

    // Llenar géneros
    genders.forEach((gender) => {
      let option = document.createElement('option');
      option.value = gender.id;
      option.textContent = gender.name;
      selectGender.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
}
