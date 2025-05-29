import { renderTypeGrid } from './modules/renderTypeGrid.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';

const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');

dropDownTypeMenu(categoriesDropDown, 'categories');
dropDownTypeMenu(gendersDropDown, 'genders');

const api = 'https://pruebastv.kmc.es/api/';
const categoriesResponse = await fetch(api + 'categories');
const categoriesData = await categoriesResponse.json();

renderTypeGrid('/api/genders', 'genders', 'gender');
