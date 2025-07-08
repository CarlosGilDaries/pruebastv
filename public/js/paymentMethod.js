import { selectPlan } from './modules/selectPlan.js';

const token = localStorage.getItem('auth_token');
const months = localStorage.getItem('months');
const planId = localStorage.getItem('id');
const paypal = document.querySelector('.paypal-btn');
const redsys = document.querySelector('.redsys-btn');
paypal.value = months;
redsys.value = months;

async function chooseMethod() {
  redsys.addEventListener('click', async function () {
    await selectPlan(planId, token, redsys.value);
  });
}

chooseMethod();
