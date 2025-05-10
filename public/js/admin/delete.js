import { renderContents } from '../backUpjs/renderContents.js';
import { setupDeleteButtons } from '../backUpjs/deleteButtons.js';

document.addEventListener('DOMContentLoaded', async function () {
  const url = window.location.pathname;
  let model;
  if (url.includes('ads')) {
    model = 'ads';
  } else {
    model = 'content';
  }
  const token = localStorage.getItem('auth_token');
  const backendAPI = 'https://pruebastv.kmc.es/api/';
  const success = document.getElementById('success-message');
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

    renderContents(currentContents, 'admin-panel', 'fas fa-trash');

    searchInput.addEventListener('input', function (e) {
      currentSearchTerm = e.target.value.toLowerCase();
      currentContents = allContents.filter((content) =>
        content.title.toLowerCase().includes(currentSearchTerm)
      );
      renderContents(currentContents, 'admin-panel', 'fas fa-trash');
      setupDeleteButtons(
        '.admin-form',
        backendAPI + `delete/${model}`,
        token,
        success,
        model
      );
    });

    setupDeleteButtons(
      '.admin-form',
      backendAPI + `delete-${model}`,
      token,
      success,
      model
    );

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.log(error);
  }
});
