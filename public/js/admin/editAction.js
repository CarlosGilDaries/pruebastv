import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { getContentTranslations } from '../modules/contentTranslations.js';
import { showFormErrors } from '../modules/showFormErrors.js';
import { buildSeoFormData } from '../modules/buildSeoFormData.js';
import { getSeoSettingsValues } from '../modules/getSeoSettingsValues.js';
import { buildSeoInputs } from '../modules/buildSeoInputs.js';
import { setupSlugGenerator } from '../modules/setUpSlugGeneratos.js';
import {
  buildScriptInputs,
  buildScriptFormData,
  getScriptValues
} from '../modules/buildScriptsSettings.js';

buildSeoInputs();
buildScriptInputs();
setupSlugGenerator();

async function editActionForm() {
  const id = localStorage.getItem('id');
  const token = localStorage.getItem('auth_token');
  const backendAPI = '/api/';

  generateTranslationInputs(token);

  setTimeout(async function() {
    await loadActionData(id);
  }, 1000);

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

      let isValid = true;

      if (document.getElementById('picture')) {
        const coverInput = document.getElementById('picture');
        if (coverInput.files.length > 0) {
          const coverFile = coverInput.files[0];
          const validImageTypes = ['image/jpeg', 'image/jpg'];

          if (!validImageTypes.includes(coverFile.type)) {
            showFormErrors('picture', 'La imagen debe ser un archivo JPG');
            isValid = false;
          } else {
            // Esperar a que se cargue la imagen para verificar dimensiones
            const validDimensions = await new Promise((resolve) => {
              const img = new Image();
              img.onload = function () {
                const ok = this.width === 1024 && this.height === 768;
                if (!ok) {
                  showFormErrors(
                    'picture',
                    'La imagen debe tener dimensiones de 1024x768px'
                  );
                }
                resolve(ok);
              };
              img.onerror = () => {
                showFormErrors('picture', 'No se pudo verificar la imagen.');
                resolve(false);
              };
              img.src = URL.createObjectURL(coverFile);
            });

            if (!validDimensions) isValid = false;
          }
        }
      }

      if (!isValid) {
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

        const languagesResponse = await fetch(`/api/all-languages`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        const languagesData = await languagesResponse.json();
        const languages = languagesData.languages;

        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('order', document.getElementById('order').value);
        formData.append('text', document.getElementById('text').value);
        formData.append('subtext', document.getElementById('subtext').value);
        formData.append(
          'button_text',
          document.getElementById('button_text').value
        );
        formData.append('url', document.getElementById('url').value);

        languages.forEach((language) => {
          if (language.code !== 'es') {
            const textValue = document.getElementById(
              `${language.code}-text`
            )?.value;
            if (textValue) {
              formData.append(
                `translations[${language.code}][text]`,
                textValue
              );
            }

            const subTextValue = document.getElementById(
              `${language.code}-subtext`
            )?.value;
            if (subTextValue) {
              formData.append(
                `translations[${language.code}][subtext]`,
                subTextValue
              );
            }

            const buttonValue = document.getElementById(
              `${language.code}-button`
            )?.value;
            if (buttonValue) {
              formData.append(
                `translations[${language.code}][button]`,
                buttonValue
              );
            }
          }
        });

        const pictureInput = document.getElementById('picture');
        if (pictureInput.files.length > 0) {
          formData.append('picture', pictureInput.files[0]);
        }

        const response = await fetch(backendAPI + `edit-action/${id}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || 'Error al añadir la etiqueta');
        }
  
        // Crear SEO si el usuario llenó datos
        if (seoForm.querySelectorAll('input, textarea').length > 0) {
          const { seoFormData, seo } = buildSeoFormData('action');
          if (data.success && seo) {
            let seoResponse;
            if (data.action.seo_setting_id == null) {
              seoResponse = await fetch(
                backendAPI + `create-seo-settings/${data.action.id}`,
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
                `edit-seo-settings/${data.action.seo_setting_id}/${data.action.id}`,
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
            if (data.action.scripts.length != 0) {
              const scripts = data.action.scripts;
              let googleScriptId;
              scripts.forEach((script) => {
                if (script.action_id == data.action.id) {
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
                backendAPI + `create-script/${data.action.id}/action`,
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

  async function loadActionData(id) {
    try {
      // Cargar datos en paralelo
      const [orderResponse, actionResponse, languagesResponse] =
        await Promise.all([
          fetch(backendAPI + 'actions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendAPI}action/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/all-languages`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

      const [orderData, actionData, languagesData] = await Promise.all([
        orderResponse.json(),
        actionResponse.json(),
        languagesResponse.json(),
      ]);

      if (!actionData.success || !actionData.action) {
        throw new Error(
          actionData.message || 'Error al cargar los datos de la acción'
        );
      }

      const positions = orderData.positions || [];
      const action = actionData.action;
      const languages = languagesData.languages;
      const select = document.getElementById('order');

      // Llenar opciones de orden
      positions.forEach((position) => {
        const option = document.createElement('option');
        option.value = position;
        option.textContent = position;
        select.appendChild(option);
      });

      // Establecer valores del formulario
      document.getElementById('name').value = action.name || '';
      document.getElementById('order').value = action.order || '';
      document.getElementById('text').value = action.text || '';
      document.getElementById('subtext').value = action.subtext || '';
      document.getElementById('button_text').value = action.button_text || '';
      document.getElementById('url').value = action.url || '';
      if (actionData.success && actionData.action) {
        getContentTranslations(languages, id);
        if (action.seo_setting != null) {
          getSeoSettingsValues(action.seo_setting);
        }
        if (action.scripts.length != 0) {
          const scripts = action.scripts;
          scripts.forEach((script) => {
            getScriptValues(script);
          });
        }
      }

      // Mostrar nombre de la imagen actual si existe
      if (action.picture) {
        const fileName = action.picture.split('/').pop();
        const pictureInput = document.getElementById('picture');
        // Bootstrap 5 no soporta mostrar el nombre del archivo actual directamente
        // Podemos agregar un pequeño texto informativo
        const fileInfo = document.createElement('small');
        fileInfo.className = 'form-text text-muted d-block mt-1';
        fileInfo.textContent = `Imagen actual: ${fileName}`;
        pictureInput.parentNode.insertBefore(
          fileInfo,
          pictureInput.nextSibling
        );
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos: ' + error.message);
    }
  }
}
/*
  // Manejar envío del formulario
  document
    .getElementById('form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validar formulario
      if (!this.checkValidity()) {
        e.stopPropagation();
        this.classList.add('was-validated');
        return;
      }

      let isValid = true;

      if (document.getElementById('picture')) {
        
        const coverInput = document.getElementById('picture');
        if (coverInput.files.length > 0) {
          const coverFile = coverInput.files[0];
          const validImageTypes = ['image/jpeg', 'image/jpg'];
      
          if (!validImageTypes.includes(coverFile.type)) {
            showFormErrors('picture', 'La imagen debe ser un archivo JPG');
            isValid = false;
          } else {
            // Esperar a que se cargue la imagen para verificar dimensiones
            const validDimensions = await new Promise((resolve) => {
              const img = new Image();
              img.onload = function () {
                const ok = this.width === 1024 && this.height === 768;
                if (!ok) {
                  showFormErrors(
                    'picture',
                    'La imagen debe tener dimensiones de 1024x768px'
                  );
                }
                resolve(ok);
              };
              img.onerror = () => {
                showFormErrors('picture', 'No se pudo verificar la imagen.');
                resolve(false);
              };
              img.src = URL.createObjectURL(coverFile);
            });
      
            if (!validDimensions) isValid = false;
          }
        }
      }

      if (!isValid) {
        return;
      }

      // Resetear mensajes de error
      document.querySelectorAll('.invalid-feedback').forEach((el) => {
        el.textContent = '';
        el.style.display = 'none';
      });
      document.querySelectorAll('.success-submit').forEach((element) => {
        element.classList.add('d-none');
      });


      // Mostrar loader
      document.getElementById('loading').classList.remove('d-none');

      try {
        const languagesResponse = await fetch(`/api/all-languages`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const languagesData = await languagesResponse.json();
        const languages = languagesData.languages;
        
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('order', document.getElementById('order').value);
        formData.append('text', document.getElementById('text').value);
        formData.append('subtext', document.getElementById('subtext').value);
        formData.append(
          'button_text',
          document.getElementById('button_text').value
        );
        formData.append('url', document.getElementById('url').value);

        languages.forEach((language) => {
          if (language.code !== 'es') {
            const textValue = document.getElementById(
              `${language.code}-text`
            )?.value;
            if (textValue) {
              formData.append(
                `translations[${language.code}][text]`,
                textValue
              );
            }

            const subTextValue = document.getElementById(
              `${language.code}-subtext`
            )?.value;
            if (subTextValue) {
              formData.append(
                `translations[${language.code}][subtext]`,
                subTextValue
              );
            }

            const buttonValue = document.getElementById(
              `${language.code}-button`
            )?.value;
            if (buttonValue) {
              formData.append(
                `translations[${language.code}][button]`,
                buttonValue
              );
            }
          }
        });

        const pictureInput = document.getElementById('picture');
        if (pictureInput.files.length > 0) {
          formData.append('picture', pictureInput.files[0]);
        }

        const { seoFormData, seo } = buildSeoFormData('action');

        const response = await fetch(`${backendAPI}edit-action/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          // Mostrar errores del servidor si existen
          if (data.errors) {
            Object.entries(data.errors).forEach(([field, messages]) => {
              const errorElement = document.getElementById(`${field}-error`);
              if (errorElement) {
                errorElement.textContent = messages.join(', ');
                errorElement.style.display = 'block';
              }
            });
          } else {
            throw new Error(data.message || 'Error al actualizar la acción');
          }
          return;
        }

        if (data.success && seo) {
          if (data.action.seo_setting_id == null) {
            const seoResponse = await fetch(
              backendAPI + `create-seo-settings/${data.action.id}`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: seoFormData,
              }
            );

            const seoData = await seoResponse.json();
          } else {
            const seoResponse = await fetch(
              backendAPI +
                `edit-seo-settings/${data.action.seo_setting_id}/${data.action.id}`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: seoFormData,
              }
            );

            const seoData = await seoResponse.json();
          }
        }

        // Mostrar mensaje de éxito
        document.querySelectorAll('.success-submit').forEach((element) => {
          element.classList.remove('d-none');
        });

        setTimeout(() => {
          document.querySelectorAll('.success-submit').forEach((element) => {
            element.classList.add('d-none');
          });
        }, 5000);

      } catch (error) {
        console.error('Error al enviar el formulario:', error);
        alert('Error al guardar los cambios: ' + error.message);
      } finally {
        document.getElementById('loading').classList.add('d-none');
      }
    });
}*/

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', editActionForm);
