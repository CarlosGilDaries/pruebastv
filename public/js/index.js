import { logOut } from './modules/logOut.js';
import { initPriorityBanner } from './modules/initPriorityBanner.js';
import { renderCategories } from './modules/renderCategories.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';

const token = localStorage.getItem('auth_token');
const api = 'https://pruebastv.kmc.es/api/';
const backendURL = 'https://pruebastv.kmc.es';
const email = localStorage.getItem('current_user_email');
const device_id = localStorage.getItem('device_id_' + email);

document.addEventListener('DOMContentLoaded', function () {
  if (device_id == null && token != null) {
    logOut(token);
  }
  const menu = document.querySelector('.menu');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 1) {
      // Si se ha hecho scroll hacia abajo
      menu.classList.add('scrolled');
      document.body.style.paddingTop = '56px';
    } else {
      menu.classList.remove('scrolled');
      document.body.style.paddingTop = '0';
    }
  });
});

async function indexData(api, backendURL) {
  try {
    const categoriesResponse = await fetch(api + 'categories');
    const categoriesData = await categoriesResponse.json();
    const categoriesDropDown = document.getElementById('categories');
	  const gendersDropDown = document.getElementById('genders');
    const main = document.querySelector('main');

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

    initPriorityBanner(categoriesData);
    renderCategories(main, categoriesData, backendURL);
  } catch (error) {
    console.log(error);
  }
}

indexData(api, backendURL);

document.addEventListener('DOMContentLoaded', async function () {
  const userIcon = document.querySelector('.user');
  const navRight = document.querySelector('.right-nav');

  if (token == null) {
    if (userIcon) userIcon.remove();

    const unloggedButtonsContainer = document.createElement('li');
    unloggedButtonsContainer.classList.add('unlogged-buttons');
    const loginButton = document.createElement('a');
    loginButton.href = '/login';
    const registerButton = document.createElement('a');
    registerButton.href = '/register.html';
    loginButton.innerHTML = `<button class="login-btn">Iniciar sesión</button>`;
    registerButton.innerHTML = `<button class="signup-btn">Registrarse</button>`;
    unloggedButtonsContainer.appendChild(loginButton);
    unloggedButtonsContainer.appendChild(registerButton);
    navRight.appendChild(unloggedButtonsContainer);
  }
});
