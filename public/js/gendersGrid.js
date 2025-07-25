import { renderTypeGrid } from './modules/renderTypeGrid.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { setupLoginSignupButtons } from './modules/loginSignupButtons.js';
import { clickLogOut } from './modules/clickLogOutButton.js';

const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');
const token = localStorage.getItem('auth_token');

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

const api = 'https://pruebastv.kmc.es/api/';
const categoriesResponse = await fetch('/api/categories');
const categoriesData = await categoriesResponse.json();

renderTypeGrid('/api/genders', 'genders', 'gender');

setupLoginSignupButtons();
clickLogOut();