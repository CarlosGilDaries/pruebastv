import { clickLogOut } from './modules/clickLogOutButton.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { setupLoginSignupButtons } from './modules/loginSignupButtons.js';

const container = document.getElementById('privacy-politic');
const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');

async function loadPrivacyPolitic() {
    const response = await fetch('/api/privacy-politic');
    const data = await response.json();

    data.privacyPolitics.forEach(item => {
      const titleContainer = document.createElement('div');
      titleContainer.classList.add('title');
      titleContainer.setAttribute(
        'data-i18n',
        `privacy_politic_${item.id}_title`
      );
      const textContainer = document.createElement('div');
      textContainer.classList.add('text');
      textContainer.setAttribute(
          'data-i18n',
          `privacy_politic_${item.id}_text`
        );
      container.appendChild(titleContainer);
      container.appendChild(textContainer);
    });
}

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

setupLoginSignupButtons();
clickLogOut();

loadPrivacyPolitic();