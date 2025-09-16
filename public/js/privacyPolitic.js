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
        const itemContainer = document.createElement('div');
        itemContainer.innerHTML = `<h2 class="title" data-i18n="privacy_politic_${item.id}_title">${item.title}</h2>
                                    ${item.text}`;
        const text = itemContainer.querySelector('p');
        text.setAttribute(
          'data-i18n',
          `privacy_politic_${item.id}_text`
        );
        container.appendChild(itemContainer);
    });
}

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

setupLoginSignupButtons();
clickLogOut();

loadPrivacyPolitic();