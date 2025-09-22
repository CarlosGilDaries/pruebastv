import { logOut } from './modules/logOut.js';
import { initPriorityBanner } from './modules/initPriorityBanner.js';
import { renderCategories } from './modules/renderCategories.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { setupLoginSignupButtons } from './modules/loginSignupButtons.js';
import { checkDeviceID } from './modules/checkDeviceId.js';
import { clickLogOut } from './modules/clickLogOutButton.js';
import { getVideoContent } from './modules/getVideoContent.js';
import { resetFreeExpiration } from './modules/checkForFreeExpiration.js';
import { showSpinner } from './modules/spinner.js';
import { hideSpinner } from './modules/spinner.js';

const token = localStorage.getItem('auth_token');
const api = 'https://pruebastv.kmc.es/api/';
const backendURL = 'https://pruebastv.kmc.es';
const email = localStorage.getItem('current_user_email');
const device_id = localStorage.getItem('device_id_' + email);
const keepWatching = document.getElementById('keep-watching');
const keepWatchingVideoContent = document.getElementById('video-content-0');

document.addEventListener('DOMContentLoaded', function () {
  if (device_id == null && token != null) {
    logOut(token);
  }

  clickLogOut();
  
  checkDeviceID(token);

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

async function indexData() {
  try {
    showSpinner();
    if ((device_id != null && token != null)) {
      const progressResponse = await fetch('/api/movie-progress', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const progressData = await progressResponse.json();
      if (progressData.success) {
        keepWatching.style.display = 'flex';
        const content = progressData.movies;
        let contentArray = [];
      content.forEach(movie => {
        contentArray.push(movie.movie);
      });
      getVideoContent(contentArray, keepWatchingVideoContent);
      }
    }

    const categoriesResponse = await fetch('/api/categories');
    const categoriesData = await categoriesResponse.json();
    const categoriesDropDown = document.getElementById('categories');
	  const gendersDropDown = document.getElementById('genders');
    const main = document.querySelector('main');

    dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
    dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

    initPriorityBanner(categoriesData);
    renderCategories(main, categoriesData);
  } catch (error) {
    console.log(error);
  } finally {
    hideSpinner();
  }
}

indexData();

setupLoginSignupButtons();
if (token != null) {
  resetFreeExpiration(token);
}



