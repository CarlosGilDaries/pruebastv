import { logOut } from '../modules/logOut.js';
import { adminCheck } from '../modules/adminCheck.js';

const email = localStorage.getItem('current_user_email');
const device_id = localStorage.getItem('device_id_' + email);
const token = localStorage.getItem('auth_token');
const logOutButton = document.querySelector('.login-btn');
const backendAPI = 'https://pruebastv.kmc.es/api/';

if (token == null) {
  window.location.href = '/login';
}

if (device_id == null) {
  logOut(token);
}
