import { selectPlan } from './modules/selectPlan.js';
import { paypalPayment } from './modules/paypal.js';

const token = localStorage.getItem('auth_token');
const months = localStorage.getItem('months');
const planId = localStorage.getItem('plan_id');
const paypal = document.querySelector('.paypal-btn');
const redsys = document.querySelector('.redsys-btn');
paypal.value = months;
redsys.value = months;

async function chooseMethod() {
    redsys.addEventListener('click', async function () {
        redsys.disabled = true;
        paypal.disabled = true;
        await selectPlan(planId, token, redsys.value, true);
  });
    
    paypal.addEventListener('click', async function () {
        paypal.disabled = true;
        redsys.disabled = true;
      await paypalPayment(planId, token, paypal.value, true);
  })
}

chooseMethod();
