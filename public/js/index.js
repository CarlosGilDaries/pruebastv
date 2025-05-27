import { logOut } from './modules/logOut.js';
import { initPriorityBanner } from './modules/initPriorityBanner.js';
import { renderCategories } from './modules/renderCategories.js';

const token = localStorage.getItem('auth_token');
const apiContent = 'https://pruebastv.kmc.es/api/content';
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
    const sections = document.querySelectorAll('.content-type');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    dropdownMenu.innerHTML = '';
    categoriesData.categories.forEach((category) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#`;
      a.textContent = category.name;
      li.appendChild(a);
      dropdownMenu.appendChild(li);
    });

    // Manejar el dropdown en móviles
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdown = document.querySelector('.dropdown');

    dropdownToggle.addEventListener('click', function (e) {
      if (window.innerWidth <= 991) {
        e.preventDefault();
        dropdown.classList.toggle('active');
      }
    });

    initPriorityBanner(categoriesData);
    renderCategories(categoriesData, sections, backendURL);
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

    const loginButton = document.createElement('li');
    loginButton.innerHTML = `<a href="/login"><button class="login-btn">Iniciar sesión</button></a>`;
    navRight.appendChild(loginButton);
  }
});
