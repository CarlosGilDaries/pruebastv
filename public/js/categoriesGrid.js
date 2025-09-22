import { renderTypeGrid } from './modules/renderTypeGrid.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { setupLoginSignupButtons } from './modules/loginSignupButtons.js';
import { clickLogOut } from './modules/clickLogOutButton.js';
import { aceptedCookies } from './modules/acceptedCookies.js';

const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

const api = 'https://pruebastv.kmc.es/api/';
const categoriesResponse = await fetch('/api/categories');
const categoriesData = await categoriesResponse.json();

renderTypeGrid('/api/dropdown-categories-menu', 'categories', 'category');

setupLoginSignupButtons();
clickLogOut();
aceptedCookies();



