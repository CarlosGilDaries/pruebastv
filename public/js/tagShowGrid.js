import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { gridShow } from './modules/gridShow.js';
import { clickLogOut } from './modules/clickLogOutButton.js';

const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');
const title = document.querySelector('.grid-title');
const urlParams = new URLSearchParams(window.location.search);
let tagId;
if (window.PAGE_ID) {
  tagId = window.PAGE_ID;
} else {
  tagId = urlParams.get('id');
}

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

gridShow(title, 'tag', tagId);
clickLogOut();