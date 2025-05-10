import { logOut } from './modules/logOut.js';

document
  .getElementById('logout-button')
  .addEventListener('click', async function (event) {
    event.preventDefault();

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No se encontró el token de autenticación');
      return;
    }

    logOut(token);
});