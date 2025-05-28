import { getIp } from '../modules/getIp.js';
import { logOut } from '../modules/logOut.js';
import { adminCheck } from '../modules/adminCheck.js';

const pathParts = window.location.pathname.split('/');
const adSlug = pathParts[pathParts.length - 1]; // Extraer el último segmento de la URL
const apiShow = 'https://pruebastv.kmc.es/api/ad/' + adSlug;
const backendURL = 'https://pruebastv.kmc.es';

const token = localStorage.getItem('auth_token');

if (token == null) {
  window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', adminCheck(token));

const email = localStorage.getItem('current_user_email');
const device_id = localStorage.getItem('device_id_' + email);
const ip = await getIp();
const userAgent = navigator.userAgent;

/*if (device_id == null) {
  logOut(token);
}*/

fetch(apiShow, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'User-Device-ID': device_id,
    'User-Ip': ip,
    'User-Agent': userAgent,
    Authorization: `Bearer ${token}`,
  },
})
  .then((response) => response.json())
  .then((data) => {
      if (data.success) {
          console.log(data);
      const player = videojs('my-video');
      const videoJsElement = player.el();
      const backButtonContainer = document.createElement('div');
      backButtonContainer.className = 'vjs-back-button-container';
      const backButton = document.createElement('img');
      backButton.src = '/images/left.png';
      backButton.className = 'vjs-back-button';
      backButton.addEventListener('click', () => {
        history.back();
      });

      const videoTitle = document.createElement('div');
      videoTitle.className = 'vjs-video-title';
      videoTitle.textContent = data.data.title;

      backButtonContainer.appendChild(backButton);
      backButtonContainer.appendChild(videoTitle);
      player.el().appendChild(backButtonContainer);

      let inactivityTimer;

      function handleOverlays(show) {
        if (show) {
          videoJsElement.classList.add('show-overlays');
          resetInactivityTimer();
        } else if (!player.paused()) {
          videoJsElement.classList.remove('show-overlays');
        }
      }

      function showBackButton() {
        backButtonContainer.classList.add('visible');
        resetInactivityTimer();
      }

      function hideBackButton() {
        if (!player.paused()) {
          backButtonContainer.classList.remove('visible');
        }
      }

      function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        if (!player.paused()) {
          inactivityTimer = setTimeout(() => {
            hideBackButton();
            videoJsElement.classList.remove('show-overlays');
          }, 3000);
        }
      }

      player.el().addEventListener('mousemove', () => {
        showBackButton();
        handleOverlays(true);
      });

      player.on('play', () => {
        resetInactivityTimer();
      });

      player.on('pause', () => {
        clearTimeout(inactivityTimer);
        showBackButton();
        handleOverlays(true);
      });

      if (player.paused()) {
        showBackButton();
        handleOverlays(true);
      }

      document.title = data.data.title;
      const videoUrl = backendURL + data.data.url;
      document.title = data.data.title;

      player.src({
        src: videoUrl,
        type: data.data.type,
      });

      player.play();
    }
  })
  .catch((error) => {
    console.error('Error en la solicitud: ', error);
  });
