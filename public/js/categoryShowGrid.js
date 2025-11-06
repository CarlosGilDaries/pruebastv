import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { gridShow } from './modules/gridShow.js';
import { clickLogOut } from './modules/clickLogOutButton.js';
import { aceptedCookies } from './modules/acceptedCookies.js';

const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');
const title = document.querySelector('.grid-title');
const urlParams = new URLSearchParams(window.location.search);
let categoryId;
if (window.PAGE_ID) {
  categoryId = window.PAGE_ID;
} else {
  categoryId = urlParams.get('id');
}

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

gridShow(title, 'category', categoryId);

clickLogOut();
aceptedCookies();