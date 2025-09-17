import { clickLogOut } from './modules/clickLogOutButton.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { setupLoginSignupButtons } from './modules/loginSignupButtons.js';

const container = document.getElementById('cookies');
const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');

async function loadCookie() {
  const response = await fetch('/api/cookies');
  const data = await response.json();

  data.cookies.forEach((item) => {
    const section = document.createElement('section');
    section.classList.add('mb-5');
    const titleContainer = document.createElement('h2');
    titleContainer.classList.add('title', 'h4', 'fw-bold', 'mb3');
    titleContainer.setAttribute(
      'data-i18n',
      `cookie_${item.id}_title`
    );
    const textContainer = document.createElement('div');
    textContainer.classList.add('text', 'mb3');
    textContainer.setAttribute('data-i18n', `cookie_${item.id}_text`);
    section.appendChild(titleContainer);
    section.appendChild(textContainer);
    container.appendChild(section);
  });
}

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

setupLoginSignupButtons();
clickLogOut();

loadCookie();
