import { clickLogOut } from './modules/clickLogOutButton.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { setupLoginSignupButtons } from './modules/loginSignupButtons.js';

const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');

const container = document.getElementById('legal-notice');

async function loadLegalNotice() {
  const response = await fetch('/api/legal-notice');
  const data = await response.json();

  data.legalNotices.forEach((item) => {
    const itemContainer = document.createElement('div');
    itemContainer.innerHTML = `<h2 class="title">${item.title}</h2>
                                    ${item.text}`;
    container.appendChild(itemContainer);
  });
}

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

setupLoginSignupButtons();
clickLogOut();

loadLegalNotice();
