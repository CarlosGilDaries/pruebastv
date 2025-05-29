import { logOut } from './modules/logOut.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';

const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

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