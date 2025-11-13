import { getIp } from './modules/getIp.js';
import { setGoogleAnalyticsScript } from './modules/setScripts.js';

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
        if (userData.data.user.email_verified_at == null) {
          window.location.href = '/verificar-email';
          return;
        } else {
          window.location.href = '/';
        }
      } 
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  });

setGoogleAnalyticsScript();