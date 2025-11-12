import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { gridShow } from './modules/gridShow.js';
import { clickLogOut } from './modules/clickLogOutButton.js';
import { setGoogleAnalyticsScript } from './modules/setScripts.js';

const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');
const token = localStorage.getItem('auth_token');

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');
setGoogleAnalyticsScript(null, 'paid-resources')
    .then(() => {
        gridShow(null, 'paid-resources', null, token);
    })
    .catch((err) => console.error(err));

clickLogOut();