import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { setGoogleAnalyticsScript } from './modules/setScripts.js';

document.addEventListener('DOMContentLoaded', async function () {
  const token = localStorage.getItem('auth_token');
  const email = localStorage.getItem('current_user_email');

  if (token == null) {
    window.location.href = '/login';
    return;
  }

  const plansList = document.querySelector('.plans-list');
  const message = document.querySelector('.message');
  const h2 = document.querySelector('h2');
  const actualPlan = sessionStorage.getItem('actual_plan');
  const neededPlans = [
    ...new Set(sessionStorage.getItem('needed_plans').split(',')),
  ];
  const link = document.getElementById('link-to-plans');
  if (actualPlan) {
    h2.innerHTML = `<span data-i18n="manage_plans_actual_plan">Plan Actual</span> - ${actualPlan}`;
    message.innerHTML = `No se puede visualizar este contenido con el plan actual. Plan/es necesarios:`;
    message.setAttribute('data-i18n', 'manage_plans_text');
    link.innerHTML = `CAMBIAR DE PLAN`;
    link.setAttribute('data-i18n', 'manage_plans_link');
  } else {
    h2.innerHTML = `<span data-i18n="manage_plans_actual_plan">Plan Actual</span> - <span data-i18n="manage_plans_none">Ninguno</span>`;
    message.innerHTML = `Plan/es para visualizar este contenido:`;
    message.setAttribute('data-i18n', 'manage_plans_none_text');
    link.innerHTML = `SUSCRIBIRSE A UN PLAN`;
    link.setAttribute('data-i18n', 'manage_plans_link_2');
  }

  neededPlans.forEach((plan) => {
    if (plan != 'admin') {
      const planElement = document.createElement('div');
      planElement.className = 'device-item plan-item';

      const planName = document.createElement('p');
      planName.className = 'device-name plan-name';
      planName.textContent = plan || 'Dispositivo sin nombre';

      planElement.appendChild(planName);
      plansList.appendChild(planElement);
    }
  });
});

const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

setGoogleAnalyticsScript();