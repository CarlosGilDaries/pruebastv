import { renderTypeGrid } from './modules/renderTypeGrid.js';
import { dropDownMenu } from './modules/dropDownMenu.js';

const api = 'https://pruebastv.kmc.es/api/';
const categoriesResponse = await fetch(api + 'categories');
const categoriesData = await categoriesResponse.json();
const dropDown = document.querySelector('.dropdown-menu');

dropDownMenu(dropDown, api);

renderTypeGrid('/api/genders-grid', 'genders', 'gender');
