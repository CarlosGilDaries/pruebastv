import { selectPlan } from './modules/selectPlan.js';

const token = localStorage.getItem('auth_token');
const backendApi = 'https://pruebastv.kmc.es/api/';
const neededPlans = localStorage.getItem('needed_plans');
let userData;

try {
  const response = await fetch('/api/plans');
  if (token != null) {
    const userResponse = await fetch('/api/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    userData = await userResponse.json();
  }

  const data = await response.json();

  if (
    token != null &&
    userData.success &&
    data.success &&
    userData.data.plan != null
  ) {

    // Generar una diferencia de 48 horas o menos para la condición de renovar
    const now = new Date();
    const expirationDate = new Date(userData.data.user.plan_expires_at);
    console.log(userData);
    const msDiff = expirationDate - now;
    const hoursLeft = msDiff / (1000 * 60 * 60);
    const canRenew = hoursLeft <= 48;

    const plans = data.plans;
    const actualPlan = userData.data.plan.name;
    displayPlans(plans, actualPlan, canRenew);
  } else if (data.success) {
    const plans = data.plans;
    displayPlans(plans, null);
  }

  window.addEventListener('beforeunload', function () {
    localStorage.removeItem('needed_plans');
  });
} catch (error) {
  console.error('Error en la solicitud:', error);
}

function displayPlans(plans, actualPlan, canRenew) {
  const main = document.querySelector('.main');
  const container = document.getElementById('plans-container');
  container.innerHTML = ''; // Limpiar contenedor antes de agregar planes
  const title = document.createElement('h1');
  title.innerHTML = 'Elige uno  de nuestros planes';
  title.style.color = 'white';
  main.appendChild(title);
  main.appendChild(container);

  plans.forEach((plan) => {
    const card = document.createElement('div');
    card.className = `plan-card ${plan.name.toLowerCase()}`;
/*
    // Badge para anuncios
    const adsBadge = plan.ads
      ? '<div class="ads-badge">CON ADS</div>'
      : '<div class="no-ads-badge">SIN ADS</div>';
*/
    // Contenido común del card
    let price = ''
    if (plan.trimestral_price == 0) {
      price = '<div class="plan-feature">Gratis</div>';
    } else {
      price = `<div class="plan-feature">
            Precio trimestral: ${plan.trimestral_price} €
          </div>
          <div class="plan-feature">
            Precio anual: ${plan.anual_price} €
          </div>`;
      }

    card.innerHTML = `

      <div class="plan-name">${plan.name}</div>
      <div class="plan-features">
          ${price}
          <div class="plan-feature">
          ${plan.max_devices} dispositivo${plan.max_devices > 1 ? 's' : ''}
          </div>
          <div class="plan-feature">
          ${plan.max_streams} pantalla${
      plan.max_streams > 1 ? 's' : ''
    }
          </div>
          <div class="plan-feature">
          ${plan.ads ? 'Con anuncios' : 'Sin anuncios'}
          </div>
      </div>
    `;

    // Crear botón según condiciones
    const button = document.createElement('button');
    button.value = 3;
    const button2 = document.createElement('button');
    button2.value = 12;
    button.className = 'plan-button';
    button2.className = 'plan-button';

    if (actualPlan) {
      if (plan.name === actualPlan) {
        if (plan.trimestral_price == 0) {
          button.textContent = 'Plan Actual';
          button.classList.add('actual-plan', 'free-button');
          button.disabled = true;
        }
        else if (userData.data.suscription == 'anual') {
          button2.textContent = 'Renovar Plan Actual';
          button2.classList.add('actual-plan');
          button2.addEventListener('click', async () => {
            if (canRenew) {
              if (
                confirm(`¿Quieres renovar el plan ${plan.name} durante 1 año?`)
              ) {
                await selectPlan(plan.id, token, button2.value);
              }
            } else {
              alert(
                'Para poder renovar, el plan debe expirar en 48 horas o menos.'
              );
            }
          });
          button.classList.add('needed-plan');
          button.textContent = `${plan.name} Trimestral`;
          button.addEventListener('click', async () => {
            if (
              confirm(`¿Quieres probar el plan ${plan.name} durante 3 meses?`)
            ) {
              await selectPlan(plan.id, token, button.value);
            }
          });
        }
        else if (userData.data.suscription == 'trimestral') {
          button.textContent = 'Renovar Plan Actual';
          button.classList.add('actual-plan');
          button.addEventListener('click', async () => {
            if (canRenew) {
              if (
                confirm(
                  `¿Quieres renovar el plan ${plan.name} durante 3 meses?`
                )
              ) {
                await selectPlan(plan.id, token, button.value);
              }
            } else {
              alert(
                'Para poder renovar, el plan debe expirar en 48 horas o menos.'
              );
            }
          });
          button2.textContent = `${plan.name} Anual`;
          button2.classList.add('needed-plan');
          button2.addEventListener('click', async () => {
            if (
              confirm(`¿Quieres probar el plan ${plan.name} durante un año?`)
            ) {
              await selectPlan(plan.id, token, button2.value);
            }
          });
        }
      }
      if (neededPlans && !neededPlans.includes(plan.name)) {
        button.textContent = 'No aplica';
        button.disabled = true;
        button.classList.add('disabled-plan');
        if (plan.trimestral_price != 0) {
          button2.textContent = 'No aplica';
          button2.disabled = true;
          button2.classList.add('disabled-plan');
        }
      } else {
        if (plan.trimestral_price != 0 && actualPlan != plan.name) {
          button.textContent = `${plan.name} Trimestral`;
          button2.textContent = `${plan.name} Anual`;
        }
        else if (plan.trimestral_price == 0) {
          if (actualPlan != plan.name) {
            button.textContent = `${plan.name}`;
          }
          button.classList.add('free-button');
        }
        button.classList.add('needed-plan');
        if (actualPlan != plan.name) {
          button.addEventListener('click', async () => {
            if (plan.trimestral_price == 0) {
              if (confirm(`¿Quieres probar el plan ${plan.name}?`)) {
                await selectPlan(plan.id, token, button.value);
              }
            } else {
              if (
                confirm(`¿Quieres probar el plan ${plan.name} durante 3 meses?`)
              ) {
                await selectPlan(plan.id, token, button.value);
              }
            }
          });
          button2.classList.add('needed-plan');
          button2.addEventListener('click', async () => {
            if (confirm(`¿Quieres probar el plan ${plan.name} durante un año?`)) {
              await selectPlan(plan.id, token, button2.value);
            }
          });
        }
      }
    } else {
      if (neededPlans) {
        if (!neededPlans.includes(plan.name)) {
          button.textContent = 'No aplica';
          button.disabled = true;
          button.classList.add('disabled-plan');
          button2.textContent = 'No aplica';
          button2.disabled = true;
          button2.classList.add('disabled-plan');
        } else {
          if (plan.trimestral_price != 0) {
            button.textContent = `${plan.name} Trimestral`;
            button2.textContent = `${plan.name} Anual`;
          } else {
            button.textContent = `${plan.name}`;
          }
          button.classList.add('needed-plan');
          button.addEventListener('click', async () => {
            if (plan.trimestral_price == 0) {
              if (confirm(`¿Quieres probar el plan ${plan.name}?`)) {
                await selectPlan(plan.id, token, button.value);
              }
            } else {
              if (
                confirm(`¿Quieres probar el plan ${plan.name} durante 3 meses?`)
              ) {
                await selectPlan(plan.id, token, button.value);
              }
            }
          });
          button2.classList.add('needed-plan');
          button2.addEventListener('click', async () => {
            if (
              confirm(`¿Quieres probar el plan ${plan.name} durante un año?`)
            ) {
              await selectPlan(plan.id, token, button2.value);
            }
          });
        }
      } else {
        if (plan.trimestral_price != 0) {
          button.textContent = `${plan.name} Trimestral`;
          button.classList.add('needed-plan');
          button2.textContent = `${plan.name} Anual`;
          button2.classList.add('needed-plan');
        } else {
          button.textContent = `${plan.name}`;
          button.classList.add('needed-plan');
        }
        button.addEventListener('click', async () => {
          if (token != null) {
            if (plan.trimestral_price == 0) {
              if (confirm(`¿Quieres probar el plan ${plan.name}?`)) {
                await selectPlan(plan.id, token, button.value);
              }
            } else {
              if (
                confirm(`¿Quieres probar el plan ${plan.name} durante 3 meses?`)
              ) {
                await selectPlan(plan.id, token, button.value);
              }
            }
          } else {
            if (plan.trimestral_price == 0) {
              if (confirm(`¿Quieres probar el plan ${plan.name}?`)) {
                localStorage.setItem('plan_id', plan.id);
                window.location.href = '/short-register.html';
              }
            } else {
              if (
                confirm(`¿Quieres probar el plan ${plan.name} durante 3 meses?`)
              ) {
                localStorage.setItem('plan_id', plan.id);
                localStorage.setItem('months', 3);
                window.location.href = '/register.html';
              }
            }
          }
        });

        button2.addEventListener('click', async () => {
          if (token != null) {
            if (confirm(`¿Quieres probar el plan ${plan.name} durante un año?`)) {
              await selectPlan(plan.id, token, button2.value);
            }
          } else {
            if (
              confirm(`¿Quieres probar el plan ${plan.name} durante un año?`)
            ) {
              localStorage.setItem('plan_id', plan.id);
              localStorage.setItem('months', 12);
              window.location.href = '/register.html';
            }
          }
        });
      }
    }

    card.appendChild(button);
    if (button2.textContent != "") {
      card.appendChild(button2);
    }
    container.appendChild(card);
  });
}
