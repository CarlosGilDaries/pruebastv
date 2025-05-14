import { logOut } from '../modules/logOut.js';
import { adminCheck } from '../modules/adminCheck.js';

const email = localStorage.getItem('current_user_email');
const device_id = localStorage.getItem('device_id_' + email);
const token = localStorage.getItem('auth_token');
const logOutButton = document.getElementById('logout-button');
const backendAPI = 'https://pruebastv.kmc.es/api/';
const container = document.querySelector('.container');
const links = document.querySelectorAll("body > div.admin-container > aside > ul > a > li");

if (token == null) {
  window.location.href = '/login';
}

if (device_id == null) {
  logOut(token);
}

adminCheck(token);

logOutButton.addEventListener('click', function() {
	logOut(token);
});

document.addEventListener('DOMContentLoaded', function() {
	links.forEach(link => {
		if (link.getAttribute('data-content') == container.id) {
			link.classList.add('active');
		}
	})
});

