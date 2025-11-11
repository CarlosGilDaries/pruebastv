import { generateTranslationInputs } from '../modules/generateTranslationInputs.js';
import { buildSeoFormData } from '../modules/buildSeoFormData.js';
import { buildSeoInputs } from '../modules/buildSeoInputs.js';
import { setupSlugGenerator } from '../modules/setUpSlugGeneratos.js';
import {
  buildScriptInputs,
  buildScriptFormData,
} from '../modules/buildScriptsSettings.js';
import { showFormErrors } from '../modules/showFormErrors.js';

buildSeoInputs();
buildScriptInputs();
setupSlugGenerator();

async function initAddAction() {
  const backendAPI = '/api/';
  const authToken = localStorage.getItem('auth_token');
  const select = document.getElementById('order');

  generateTranslationInputs(authToken);

  const response = await fetch(backendAPI + 'actions', {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const languagesResponse = await fetch(`/api/all-languages`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  const languagesData = await languagesResponse.json();
  const languages = languagesData.languages;

  const data = await response.json();
  const positions = data.positions;

  // Llenar opciones de orden
  if (positions != null && positions.length > 0) {
    positions.forEach((position) => {
      const option = document.createElement('option');
      option.textContent = position;
      option.value = position;
      select.appendChild(option);
    });

    // Agregar última opción (n+1)
    const lastOption = document.createElement('option');
    lastOption.textContent = positions.length + 1;
    lastOption.value = positions.length + 1;
    select.appendChild(lastOption);
  } else {
    // Si no hay posiciones, agregar solo la opción 1
    const option = document.createElement('option');
    option.textContent = 1;
    option.value = 1;
    select.appendChild(option);
  }

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

        // Mostrar loader
        document.getElementById('loading').classList.remove('d-none');

        // Verificar autenticación
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        // Crear FormData
        const formData = new FormData();

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
        formData.append('name', document.getElementById('name').value);
        formData.append('order', document.getElementById('order').value);
        formData.append('text', document.getElementById('text').value);
        formData.append('subtext', document.getElementById('subtext').value);
        formData.append(
          'button_text',
          document.getElementById('button_text').value
        );
        formData.append('url', document.getElementById('url').value);

        const pictureInput = document.getElementById('picture');
        if (pictureInput.files.length > 0) {
          formData.append('picture', pictureInput.files[0]);
        }

        const response = await fetch(backendAPI + 'add-action', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
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
            const seoResponse = await fetch(
              backendAPI + `create-seo-settings/${data.action.id}`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
                body: seoFormData,
              }
            );

            const seoData = await seoResponse.json();
          }
        }
        // Crear Script (si el usuario llenó datos)
        if (scriptsForm.querySelectorAll('input, textarea').length > 0) {
          const { scriptFormData: googleScriptFormData, script: googleScript } =
            buildScriptFormData('google');
          if (data.success && googleScript) {
            const scriptResponse = await fetch(
              backendAPI + `create-script/${data.action.id}/action`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
                body: googleScriptFormData,
              }
            );

            const scriptData = await scriptResponse.json();
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
          window.location.reload();
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
}

// Inicializar el formulario cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initAddAction);
