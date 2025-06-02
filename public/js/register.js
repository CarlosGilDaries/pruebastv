import { getIp } from './modules/getIp.js';

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

		if(data.success) {
			localStorage.setItem('auth_token', data.data.auth_token);
			localStorage.setItem('current_user_email', data.data.user);

			if (data.data.require_device_registration) {
				window.location.href = '/new-device.html';
				return;
      }

      //window.location.href = '/plans.html';
		}
    } catch (error) {
      console.error('Error en la solicitud:', error);
      document.getElementById('error-message').textContent =
        'Credenciales incorrectas';
      document.getElementById('error-message').style.display = 'block';
    }
  });
  
