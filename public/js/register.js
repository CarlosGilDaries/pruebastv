import { getIp } from './modules/getIp.js';
import { selectPlan } from './modules/selectPlan.js';

const planId = localStorage.getItem('plan_id');

document
  .getElementById('register-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const surnames = document.getElementById('surnames').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address')?.value ?? null;
    const city = document.getElementById('city').value;
    const country = document.getElementById('country').value;
    const birth_year = document.getElementById('birth-year').value;
    const dni = document.getElementById('dni')?.value ?? null;
    const phone = document.getElementById('phone')?.value ?? null;
    const gender = document.getElementById('gender').value;
    const password = document.getElementById('password').value;
    const password_confirmation = document.getElementById(
      'password_confirmation'
    ).value;
    const ip = await getIp();
    const userAgent = navigator.userAgent;
    
    if (password !== password_confirmation) {
      document.getElementById('error-message').textContent =
        'Las contraseñas no coinciden';
      document.getElementById('error-message').style.display = 'block';
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'User-IP': ip,
        },
        body: JSON.stringify({
          name,
          surnames,
          email,
          address,
          city,
          country,
          birth_year,
          phone,
          dni,
          gender,
          password,
          password_confirmation,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('auth_token', data.data.auth_token);
        localStorage.setItem('current_user_email', data.data.user);
        const months = localStorage.getItem('months');

        if (data.data.require_device_registration) {
          selectPlan(planId, data.data.auth_token, months, true);
          return;
        }
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      document.getElementById('error-message').textContent =
        'Credenciales incorrectas';
      document.getElementById('error-message').style.display = 'block';
    }
  });
