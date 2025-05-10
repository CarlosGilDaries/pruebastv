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
