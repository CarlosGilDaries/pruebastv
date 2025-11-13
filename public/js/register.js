import { getIp } from './modules/getIp.js';
import { selectPlan } from './modules/selectPlan.js';
import { showPassword } from './modules/showPasword.js';
import { aceptedCookies } from './modules/acceptedCookies.js';
import { showSpinner } from './modules/spinner.js';
import { hideSpinner } from './modules/spinner.js';
import { setGoogleAnalyticsScript } from './modules/setScripts.js';

document
  .getElementById('register-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault();

    showSpinner();

    const name = document.getElementById('name').value;
    const surnames = document.getElementById('surnames').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address')?.value ?? null;
    const city = document.getElementById('city').value;
    const country = document.getElementById('country').value;
    const birth_year = document.getElementById('birth-year').value;
    const dni = document.getElementById('dni')?.value ?? null;
    const phoneNumber = document.getElementById('phone').value;
    const countryCode = document.getElementById('country-code').value;
    const role = 'web';

    let phone = null;
    let phone_code = null;
    if (phoneNumber != "") {
      phone = phoneNumber;
      phone_code = countryCode;
    }
    const gender = document.getElementById('gender').value;
    const password = document.getElementById('password').value;
    const password_confirmation = document.getElementById(
      'password_confirmation'
    ).value;
    const ip = await getIp();
    const userAgent = navigator.userAgent;
    
    if (password !== password_confirmation) {
      hideSpinner();
      document.getElementById('error-message').textContent =
        'Las contraseñas no coinciden';
      document.getElementById('error-message').style.display = 'block';
      return;
    }
    const plan_type = document.getElementById('register-form').getAttribute('data-plan');

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
          phone_code,
          dni,
          gender,
          password,
          password_confirmation,
          plan_type,
          role
        }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('auth_token', data.data.auth_token);
        localStorage.setItem('current_user_email', data.data.user);

        if (data.data.require_payment) {
          window.location.href = '/registro-metodo-de-pago'
        }
        if (data.data.require_device_registration) {
          const plan_id = sessionStorage.getItem('plan_id');
          selectPlan(plan_id, localStorage.getItem('auth_token'), 0, true);
        }
      }
    } catch (error) {
      hideSpinner();
      console.error('Error en la solicitud:', error);
      document.getElementById('error-message').textContent =
        'Credenciales incorrectas';
      document.getElementById('error-message').style.display = 'block';
    } finally {
      hideSpinner();
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    document
      .getElementById('password')
      .addEventListener('focus', function () {
        document.getElementById('error-message').textContent = '';
        document.getElementById('error-message').style.display = 'none';
      });
    document
      .getElementById('password_confirmation')
      .addEventListener('focus', function () {
        document.getElementById('error-message').textContent = '';
        document.getElementById('error-message').style.display = 'none';
      });
  });

  const passwordIcon = document.querySelector('.pass-icon');
  const ionEyeIcon = document.getElementById('eye-icon');
  const passwordInput = document.getElementById('password');
  const passwordIcon2 = document.querySelector('.pass-icon-2');
  const ionEyeIcon2 = document.getElementById('eye-icon-2');
  const confirmationPasswordInput = document.getElementById(
    'password_confirmation'
  );

  passwordIcon.addEventListener('click', (event) => {
    showPassword(event, passwordInput, ionEyeIcon);
  });
  passwordIcon2.addEventListener('click', (event) => {
    showPassword(event, confirmationPasswordInput, ionEyeIcon2);
  });

setGoogleAnalyticsScript();
aceptedCookies();