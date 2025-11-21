import { validateAddForm } from '../modules/validateAddForm.js';
import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { getContentTranslations } from '../modules/contentTranslations.js';
import { buildSeoFormData } from '../modules/buildSeoFormData.js';
import { getSeoSettingsValues } from '../modules/getSeoSettingsValues.js';
import { buildSeoInputs } from '../modules/buildSeoInputs.js';
import { setupSlugGenerator } from '../modules/setUpSlugGeneratos.js';
import {
  buildScriptInputs,
  buildScriptFormData,
  getScriptValues,
} from '../modules/buildScriptsSettings.js';

buildSeoInputs();
buildScriptInputs();
setupSlugGenerator();

async function editContentForm() {
  let id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';

  generateTranslationInputs(token);

  await loadContentData(id);

  // Manejar el checkbox para cambiar archivo de contenido
  const changeContentCheckbox = document.getElementById('change-content-file');
  /*changeContentCheckbox.addEventListener('change', function () {
    const shouldChange = this.checked;
    document
      .getElementById('type-content')
      .classList.toggle('d-none', !shouldChange);

    // Ocultar todos los campos de archivos si el checkbox no está marcado
    if (!shouldChange) {
      document.getElementById('single-content').classList.add('d-none');
      document.getElementById('hls-content').classList.add('d-none');
      document.getElementById('external-content').classList.add('d-none');
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

    singleContent.classList.add('d-none');
    hlsContent.classList.add('d-none');
    externalUrl.classList.add('d-none');

    if (type === 'video/mp4' || type === 'audio/mpeg') {
      singleContent.classList.remove('d-none');
    } else if (type === 'application/vnd.apple.mpegurl') {
      hlsContent.classList.remove('d-none');
    } else {
      externalUrl.classList.remove('d-none');
    }
  }*/

  // Manejar el envío del formulario
  const contentForm = document.getElementById('form');
  const seoForm = document.getElementById('seo-form');
  const scriptsForm = document.getElementById('scripts-form');

  [contentForm, seoForm, scriptsForm].forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      if (!(await validateAddForm())) {
        return;
      }

      // Desactivar el botón mientras se procesa
      const btn = form.querySelector("button[type='submit']");
      btn.disabled = true;

      try {
        // Resetear mensajes de error
        document
          .querySelectorAll('#form .invalid-feedback')
          .forEach((el) => (el.textContent = ''));
        document.querySelectorAll('.success-submit').forEach((element) => {
          element.classList.add('d-none');
        });

        // Mostrar loader
        document.getElementById('loading').classList.remove('d-none');

        // Crear FormData
        const languagesResponse = await fetch(`/api/all-languages`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const languagesData = await languagesResponse.json();
        const languages = languagesData.languages;

       /* const shouldChangeContent = document.getElementById(
          'change-content-file'
        ).checked;*/
        document.getElementById('loading').classList.remove('d-none');

        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('tagline', CKEDITOR.instances.tagline.getData());
        formData.append('overview', CKEDITOR.instances.overview.getData());

        languages.forEach((language) => {
          if (language.code !== 'es') {
            const titleValue = document.getElementById(
              `${language.code}-title`
            )?.value;
            if (titleValue) {
              formData.append(
                `translations[${language.code}][title]`,
                titleValue
              );
            }

            const taglineInstance =
              CKEDITOR.instances[`${language.code}-tagline`];
            if (taglineInstance) {
              formData.append(
                `translations[${language.code}][tagline]`,
                taglineInstance.getData()
              );
            }

            const overviewInstance =
              CKEDITOR.instances[`${language.code}-overview`];
            if (overviewInstance) {
              formData.append(
                `translations[${language.code}][overview]`,
                overviewInstance.getData()
              );
            }
          }
        });

        formData.append(
          'pay_per_view',
          document.getElementById('pay_per_view').checked ? '1' : '0'
        );
        formData.append(
          'rent',
          document.getElementById('rent').checked ? '1' : '0'
        );

        // Agregar campos condicionales
        if (document.getElementById('pay_per_view').checked) {
          formData.append(
            'pay_per_view_price',
            document.getElementById('pay_per_view_price').value
          );
        }
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
          formData.append(
            'end_time',
            document.getElementById('end_time').value
          );
        }

        // Procesar archivos (solo si se seleccionaron nuevos)
        const coverInput = document.getElementById('cover');
        if (coverInput.files.length > 0) {
          formData.append('cover', coverInput.files[0]);
        }

        const tallCoverInput = document.getElementById('tall-cover');
        if (tallCoverInput.files.length > 0) {
          formData.append('tall_cover', tallCoverInput.files[0]);
        }

        const trailerInput = document.getElementById('trailer');
        if (trailerInput.files.length > 0) {
          formData.append('trailer', trailerInput.files[0]);
        }

        /*// Procesar contenido solo si se debe cambiar
        if (shouldChangeContent) {
          const type = document.getElementById('type').value;
          formData.append('type', type);

          if (type === 'video/mp4' || type === 'audio/mpeg') {
            const contentInput = document.getElementById('content');
            if (contentInput.files.length > 0) {
              formData.append('content', contentInput.files[0]);
            }
          } else if (type === 'application/vnd.apple.mpegurl') {
            ['m3u8', 'ts1', 'ts2', 'ts3'].forEach((field) => {
              const input = document.getElementById(field);
              if (input.files.length > 0) {
                formData.append(field, input.files[0]);
              }
            });
          } else {
            formData.append(
              'external_url',
              document.getElementById('external_url').value
            );
          }
        }
*/
        // Agregar checkboxes seleccionados
        ['plans-container', 'categories-container', 'tags-container', 'genders-container'].forEach(
          (container) => {
            const checkboxes = document.querySelectorAll(
              `#${container} input[type="checkbox"]:checked`
            );
            const fieldName = container.split('-')[0] + '[]';
            checkboxes.forEach((checkbox) => {
              formData.append(fieldName, checkbox.value);
            });
          }
        );

        const response = await fetch(`/api/edit-serie/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al añadir la etiqueta');
        }

        // Crear SEO si el usuario llenó datos
        if (seoForm.querySelectorAll('input, textarea').length > 0) {
          const { seoFormData, seo } = buildSeoFormData('movie');
          if (data.success && seo) {
            let seoResponse;
            if (data.movie.seo_setting_id == null) {
              seoResponse = await fetch(
                backendAPI + `create-seo-settings/${data.movie.id}`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: seoFormData,
                }
              );
            } else {
              seoResponse = await fetch(
                backendAPI +
                  `edit-seo-settings/${data.movie.seo_setting_id}/${data.movie.id}`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: seoFormData,
                }
              );
            }
            const seoData = await seoResponse.json();
          }
        }
        // Crear Script (si el usuario llenó datos)
        if (scriptsForm.querySelectorAll('input, textarea').length > 0) {
          const { scriptFormData: googleScriptFormData, script: googleScript } =
            buildScriptFormData('google');
          if (data.success && googleScript) {
            if (data.movie.scripts.length != 0) {
              const scripts = data.movie.scripts;
              let googleScriptId;
              scripts.forEach((script) => {
                if (script.movie_id == data.movie.id) {
                  googleScriptId = script.id;
                }
              });

              const googleScriptResponse = await fetch(
                backendAPI + `edit-script/${googleScriptId}`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: googleScriptFormData,
                }
              );
              const googleScriptData = await googleScriptResponse.json();
            } else {
              const scriptResponse = await fetch(
                backendAPI + `create-script/${data.movie.id}/movie`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: googleScriptFormData,
                }
              );

              const scriptData = await scriptResponse.json();
            }
          }
        }

        // Mostrar mensaje de éxito
        document.querySelectorAll('.success-submit').forEach((element) => {
          element.classList.remove('d-none');
        });

        setTimeout(() => {
          document.querySelectorAll('.success-submit').forEach((element) => {
            element.classList.add('d-none');
            btn.disabled = false;
          });
        }, 2000);
      } catch (error) {
        console.error('Error:', error);
        // Mostrar error al usuario
        const errorElement = document.getElementById('name-error');
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
      } finally {
        document.getElementById('loading').classList.add('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  async function loadContentData(id) {
    try {
      const [
        response,
        plansResponse,
        tagsResponse,
        genderResponse,
        categoryResponse,
        languagesResponse,
      ] = await Promise.all([
        fetch(`/api/serie-edit-show/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/plans'),
        fetch('/api/tags'),
        fetch('/api/genders', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/dropdown-categories-menu', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/all-languages', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [
        data,
        plansData,
        tagsData,
        genderData,
        categoryData,
        languagesData,
      ] = await Promise.all([
        response.json(),
        plansResponse.json(),
        tagsResponse.json(),
        genderResponse.json(),
        categoryResponse.json(),
        languagesResponse.json(),
      ]);
      console.log(data);
      const content = data.serie;
      const plans = plansData.plans;
      const genders = genderData.genders;
      const categories = categoryData.categories;
      const tags = tagsData.tags;
      const languages = languagesData.languages;

      getContentTranslations(languages, id);
      if (content.seo_setting != null) {
        getSeoSettingsValues(content.seo_setting);
      }
      if (content.scripts.length != 0) {
        const scripts = content.scripts;
        scripts.forEach((script) => {
          getScriptValues(script);
        });
      }


      // Obtener IDs actuales de planes, categorías y etiquetas
      const currentPlansId = content.plans.map((plan) => plan.id);
      const currentCategoriesId = content.categories.map(
        (category) => category.id
      );
      const currentTagsId = content.tags.map((tag) => tag.id);
      const currentGendersId = content.genders.map((gender) => gender.id);

      // Llenar planes
      const plansContainer = document.getElementById('plans-container');
      plans.forEach((plan) => {
        const div = document.createElement('div');
        div.className = 'form-check';

        const input = document.createElement('input');
        input.className = 'form-check-input';
        input.type = 'checkbox';
        input.value = plan.id;
        input.id = `plan-${plan.id}`;
        input.name = 'plans[]';
        input.checked = currentPlansId.includes(plan.id);

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `plan-${plan.id}`;
        label.textContent = plan.name;

        div.appendChild(input);
        div.appendChild(label);
        plansContainer.appendChild(div);
      });

      // Llenar categorías
      const categoriesContainer = document.getElementById(
        'categories-container'
      );
      categories.forEach((category) => {
        const div = document.createElement('div');
        div.className = 'form-check';

        const input = document.createElement('input');
        input.className = 'form-check-input';
        input.type = 'checkbox';
        input.value = category.id;
        input.id = `category-${category.id}`;
        input.name = 'categories[]';
        input.checked = currentCategoriesId.includes(category.id);

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `category-${category.id}`;
        label.textContent = category.name;

        div.appendChild(input);
        div.appendChild(label);
        categoriesContainer.appendChild(div);
      });

      // Llenar etiquetas
      const tagsContainer = document.getElementById('tags-container');
      tags.forEach((tag) => {
        const div = document.createElement('div');
        div.className = 'form-check';

        const input = document.createElement('input');
        input.className = 'form-check-input';
        input.type = 'checkbox';
        input.value = tag.id;
        input.id = `tag-${tag.id}`;
        input.name = 'tags[]';
        input.checked = currentTagsId.includes(tag.id);

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `tag-${tag.id}`;
        label.textContent = tag.name;

        div.appendChild(input);
        div.appendChild(label);
        tagsContainer.appendChild(div);
      });

      // Llenar géneros
      const gendersContainer = document.getElementById('genders-container');
      genders.forEach((gender) => {
        const div = document.createElement('div');
        div.className = 'form-check';

        const input = document.createElement('input');
        input.className = 'form-check-input';
        input.type = 'checkbox';
        input.value = gender.id;
        input.id = `gender-${gender.id}`;
        input.name = 'genders[]';
        input.checked = currentGendersId.includes(gender.id);

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `gender-${gender.id}`;
        label.textContent = gender.name;

        div.appendChild(input);
        div.appendChild(label);
        gendersContainer.appendChild(div);
      });

      // Configurar inputs con los valores del contenido
      document.getElementById('title').value = content.title;
      //document.getElementById('type').value = content.type;

      // Configurar campos de pago
      document.getElementById('pay_per_view').checked =
        content.pay_per_view == 1;
      document.getElementById('pay_per_view_price').value =
        content.pay_per_view_price || '';
      document.getElementById('rent').checked = content.rent == 1;
      document.getElementById('rent_price').value = content.rent_price || '';
      document.getElementById('rent_days').value = content.rent_days || '';

      // Mostrar/ocultar campos de pago según corresponda
      if (content.pay_per_view == 1) {
        document
          .getElementById('pay_per_view_fields')
          .classList.remove('d-none');
      }
      if (content.rent == 1) {
        document.getElementById('rent_fields').classList.remove('d-none');
      }

      // Configurar fechas
      document.getElementById('start_time').value = content.start_time || '';
      document.getElementById('end_time').value = content.end_time || '';

      // Configurar CKEditor
      CKEDITOR.replace(`tagline`);
      CKEDITOR.instances.tagline.setData(content.tagline || '');
      CKEDITOR.instances.overview.setData(content.overview || '');

      // Configurar URL externa si corresponde
      /*if (
        content.type &&
        !['video/mp4', 'audio/mpeg', 'application/vnd.apple.mpegurl'].includes(
          content.type
        )
      ) {
        document.getElementById('external_url').value = content.url || '';
      }*/
    } catch (error) {
      console.error('Error cargando contenido:', error);
    }
  }

  // Manejar cambios en los switches de pago
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

  document.getElementById('rent').addEventListener('change', function () {
    const rentFields = document.getElementById('rent_fields');
    if (this.checked) {
      rentFields.classList.remove('d-none');
    } else {
      rentFields.classList.add('d-none');
      document.getElementById('rent_price').value = '';
      document.getElementById('rent_days').value = '';
    }
  });
}

editContentForm();
