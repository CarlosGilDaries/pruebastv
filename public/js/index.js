import { logOut } from './modules/logOut.js';
import { getAudioContent } from './modules/getAudioContent.js';
import { getVideoContent } from './modules/getVideoContent.js';
import { addScrollFunctionality } from './modules/addScrollFunctionality.js';
import { categoriesData } from './modules/categories.js';

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

categoriesData(api);

fetch(apiContent)
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      const audio = document.getElementById('audio-content');
      const video = document.getElementById('video-content');

      getAudioContent(data, audio, backendURL);
      getVideoContent(data, video, backendURL);

      addScrollFunctionality(audio, 293);
      addScrollFunctionality(video, 293);
    } else {
      console.error('Error al consultar la API: ', data.message);
    }
  })
  .catch((error) => {
    console.error('Error en la solicitud: ', error);
  });

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


