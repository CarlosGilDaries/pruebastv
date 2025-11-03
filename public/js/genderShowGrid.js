import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { gridShow } from './modules/gridShow.js';
import { clickLogOut } from './modules/clickLogOutButton.js';
import { aceptedCookies } from './modules/acceptedCookies.js';
import { showSpinner } from './modules/spinner.js';
import { hideSpinner } from './modules/spinner.js';

const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');
const title = document.querySelector('.grid-title');
const urlParams = new URLSearchParams(window.location.search);
let genderId;
if (window.PAGE_ID) {
  genderId = window.PAGE_ID;
} else {
  genderId = urlParams.get('id');
}
const documentTitle = document.getElementById('title');
document.body.id = `gender_${genderId}`;
documentTitle.setAttribute('data-i18n', `gender_${genderId}`);

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

showSpinner();
gridShow(title, 'gender', genderId);
setTimeout(() => {
  hideSpinner();
}, 300);

clickLogOut();
aceptedCookies();