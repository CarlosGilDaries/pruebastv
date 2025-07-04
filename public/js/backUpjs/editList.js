import { renderContents } from '../modules/renderContents.js';

document.addEventListener('DOMContentLoaded', async function () {
  const url = window.location.pathname;
  let model;
  if (url.includes('ads')) {
    model = 'ads'
  } else {
    model = 'content';
  }
  const token = localStorage.getItem('auth_token');
  const backendAPI = 'https://streaming.test/api/';
  let allContents = []; // Todos los contenidos
  let currentContents = []; // Contenidos actualmente mostrados (filtrados o no)
  let currentSearchTerm = ''; // Término de búsqueda actual

  try {
    const response = await fetch(backendAPI + model, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
      const data = await response.json();
    allContents = data.data;
    currentContents = [...allContents];
    const searchInput = document.getElementById('search-input');

    renderContents(currentContents, 'admin-panel', 'fas fa-pen', `/admin/edit-${model}-form.html`);

    searchInput.addEventListener('input', function (e) {
      currentSearchTerm = e.target.value.toLowerCase();
      currentContents = allContents.filter((content) =>
        content.title.toLowerCase().includes(currentSearchTerm)
      );
      renderContents(currentContents, 'admin-panel', 'fas fa-pen', `/admin/edit-${model}-form.html`);
    });

  } catch (error) {
    console.log(error);
  }
});