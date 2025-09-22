import { selectPlan } from './modules/selectPlan.js';
import { paypalPayment } from './modules/paypal.js';
import { showSpinner } from './modules/spinner.js';
import { hideSpinner } from './modules/spinner.js';


const token = localStorage.getItem('auth_token');
const months = sessionStorage.getItem('months');
const planId = sessionStorage.getItem('plan_id');
const paypal = document.querySelector('.paypal-btn');
const redsys = document.querySelector('.redsys-btn');
paypal.value = months;
redsys.value = months;

async function chooseMethod() {
  redsys.addEventListener('click', async function () {
      showSpinner();
      setTimeout(() => {
        hideSpinner();
      }, 4000);
        redsys.disabled = true;
        paypal.disabled = true;
        await selectPlan(planId, token, redsys.value, true);
  });
    
  paypal.addEventListener('click', async function () {
      showSpinner();
      setTimeout(() => {
        hideSpinner();
      }, 4000);
        paypal.disabled = true;
        redsys.disabled = true;
      await paypalPayment(planId, token, paypal.value, true);
  })
}

chooseMethod();
