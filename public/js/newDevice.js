import { getIp } from './modules/getIp.js';
import { processRedsysPayment } from './modules/redsys.js';

document
  .getElementById('new-device-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault();

    const deviceName = document.getElementById('device_name').value;
    const ip = await getIp();
    const userAgent = navigator.userAgent;
    const email = localStorage.getItem('current_user_email');
    const deviceKey = `device_id_` + email;
    const token = localStorage.getItem('auth_token');
    const selectedPlanId = localStorage.getItem('plan_id');

    try {
      const response = await fetch('/api/new-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          device_name: deviceName,
          ip: ip,
          user_agent: userAgent,
        }),
      });

      const userResponse = await fetch('/api/user', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const data = await response.json();
      const userData = await userResponse.json();

      if (data.success) {
		  localStorage.setItem(deviceKey, data.data);
        if (userData.data.plan == null) {
          selectPlan(selectedPlanId, token);
        } else {
          window.location.href = '/';
        }
      } 
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  });

  /*async function checkSelectedPlan(token) {
    const selectedPlanId = localStorage.getItem('plan_id');
    const plansResponse = await fetch('/api/plans');
    const plansData = await plansResponse.json();
    let free = false;

    plansData.plans.forEach((plan) => {
      if (plan.id == selectedPlanId && plan.price == 0) free = true;
    });

    if (free) {
      await selectPlan(selectedPlanId, token);
    } else {

    }
  }*/

  async function selectPlan(planId, token) {
    try {
      const response = await fetch('/api/select-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: planId,
        }),
      });

      const data = await response.json();

      if (data.success && data.payment_required) {
        await processRedsysPayment(data);
      } else if (data.success && !data.payment_required) {
        window.location.href = '/';
      } else {
        console.error('Error al seleccionar plan:', data.message);
        alert('Error al seleccionar el plan. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error al procesar tu solicitud.');
    }
  }