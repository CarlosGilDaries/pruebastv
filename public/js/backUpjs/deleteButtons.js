import { renderContents } from './renderContents.js';

export function setupDeleteButtons(
  formClass,
  endpoint,
  token,
  messageElement,
  model
) {
  document.querySelectorAll(formClass).forEach((form) => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const contentId = this.dataset.id;

      if (confirm('¿Estás seguro de eliminar este contenido?')) {
        try {
          const submitBtn = this.querySelector('[type="submit"]');
          submitBtn.disabled = true;
          submitBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Eliminando...';

          const deleteResponse = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content_id: contentId }),
          });

          const deleteData = await deleteResponse.json();

          if (deleteData.success) {
            messageElement.style.display = 'block';

            setTimeout(() => {
              messageElement.style.display = 'none';
            }, 5000);

            const backendAPI = 'https://streaming.test/api/';
            const response = await fetch(backendAPI + model, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const data = await response.json();
            let allContents = data.data;
            renderContents(allContents, 'admin-panel', 'fas fa-trash');
            messageElement.style.display = 'block';
            setupDeleteButtons(
              formClass,
              endpoint,
              token,
              messageElement,
              model
            );
          }
        } catch (error) {
          console.error('Error:', error);
          // Restaurar botón
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-trash"></i> Eliminar';
          }
        }
      }
    });
  });
}
