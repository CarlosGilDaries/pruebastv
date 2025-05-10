import { logOut } from './modules/logOut.js';
import { getAudioContent } from './modules/getAudioContent.js';
import { getVideoContent } from './modules/getVideoContent.js';
import { addScrollFunctionality } from './modules/addScrollFunctionality.js';

const token = localStorage.getItem('auth_token');
const api = 'https://pruebastv.kmc.es/api/content';
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
    } else {
      menu.classList.remove('scrolled');
    }
  });
});

 const allKeys = Object.keys(localStorage);
 const deviceIds = allKeys
   .filter((key) => key.startsWith('device_id_'))
  .map((key) => localStorage.getItem(key));

if (deviceIds.length != 0 && token != null) {
  try {
    const response = await fetch('https://pruebastv.kmc.es/api/check-device-id', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Device-Id': deviceIds.join(','),
      },
    });

    const idsData = await response.json();

    if (idsData.has_missing) {
      const deviceIdKeys = allKeys.filter((key) => key.startsWith('device_id_'));
      deviceIdKeys.forEach((key) => {
        const value = localStorage.getItem(key);
        if (idsData.missing_device_ids.includes(value)) {
          localStorage.removeItem(key);
          console.log(`Eliminado: ${key} con valor ${value}`);
        }
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


fetch(api)
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


