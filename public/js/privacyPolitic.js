import { clickLogOut } from './modules/clickLogOutButton.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { setupLoginSignupButtons } from './modules/loginSignupButtons.js';
import { hideSpinner, showSpinner } from './modules/spinner.js';
import { setGoogleAnalyticsScript } from './modules/setScripts.js'; 

const container = document.getElementById('privacy-politic');
const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');

async function loadPrivacyPolitic() {
  showSpinner();
  const response = await fetch('/api/privacy-politic');
  const data = await response.json();

  data.privacyPolitics.forEach((item) => {
    const section = document.createElement('section');
    section.classList.add('mb-5');
    const titleContainer = document.createElement('h2');
    titleContainer.classList.add('title', 'h4', 'fw-bold', 'mb3');
    titleContainer.setAttribute(
      'data-i18n',
      `privacy_politic_${item.id}_title`
    );
    const textContainer = document.createElement('div');
    textContainer.classList.add('text', 'mb3');
    textContainer.setAttribute('data-i18n', `privacy_politic_${item.id}_text`);
    section.appendChild(titleContainer);
    section.appendChild(textContainer);
    container.appendChild(section);
  });
  hideSpinner();
}

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

setGoogleAnalyticsScript(null, 'privacy-policy');

setupLoginSignupButtons();
clickLogOut();

loadPrivacyPolitic();
