import { selectPlan } from "./modules/selectPlan.js";

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
    const plans = data.plans;
    const actualPlan = userData.data.plan.name;
    displayPlans(plans, actualPlan);
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

function displayPlans(plans, actualPlan) {
  const main = document.querySelector('.main');
  const container = document.getElementById('plans-container');
  container.innerHTML = ''; // Limpiar contenedor antes de agregar planes
  const title = document.createElement('h1');
  title.innerHTML = "Elige uno  de nuestros planes";
  title.style.color = 'white';
  main.appendChild(title);
  main.appendChild(container);

  plans.forEach((plan) => {
    const card = document.createElement('div');
    card.className = `plan-card ${plan.name.toLowerCase()}`;

    // Badge para anuncios
    const adsBadge = plan.ads
      ? '<div class="ads-badge">CON ADS</div>'
      : '<div class="no-ads-badge">SIN ADS</div>';

    // Formatear precio
    const formattedPrice =
      plan.price === 0 ? 'Gratis' : `${plan.price}€<span>/mes</span>`;

    // Contenido común del card
    card.innerHTML = `
      ${adsBadge}
      <div class="plan-name">${plan.name}</div>
      <div class="plan-price">${formattedPrice}</div>
      <div class="plan-features">
          <div class="plan-feature">
              <i class="fas fa-laptop"></i> ${plan.max_devices} dispositivo${
      plan.max_devices > 1 ? 's' : ''
    }
          </div>
          <div class="plan-feature">
              <i class="fas fa-play"></i> ${plan.max_streams} transmisión${
      plan.max_streams > 1 ? 'es' : ''
    } simultánea${plan.max_streams > 1 ? 's' : ''}
          </div>
          <div class="plan-feature">
              <i class="fas fa-${plan.ads ? 'ad' : 'ban'}"></i> ${
      plan.ads ? 'Con anuncios' : 'Sin anuncios'
    }
          </div>
      </div>
    `;

    // Crear botón según condiciones
    const button = document.createElement('button');
    button.className = 'plan-button';
    button.id = plan.id;

    if (actualPlan) {
      if (plan.name === actualPlan) {
        button.textContent = 'Plan Actual';
        button.disabled = true;
        button.classList.add('actual-plan');
      } else if (neededPlans && !neededPlans.includes(plan.name)) {
        button.textContent = 'No aplica';
        button.disabled = true;
        button.classList.add('disabled-plan');
      } else {
        button.textContent = 'Seleccionar Plan';
        button.classList.add('needed-plan');
        button.addEventListener('click', async () => {
          if (confirm(`¿Quieres probar el plan ${plan.name}?`)) {
            await selectPlan(plan.id, token);
          }
        });
      }
    } else {
      if (neededPlans != null) {
        if (!neededPlans.includes(plan.name)) {
          button.textContent = 'No aplica';
          button.disabled = true;
          button.classList.add('disabled-plan');
        } else {
          button.textContent = 'Seleccionar Plan';
          button.classList.add('needed-plan');
          button.addEventListener('click', async () => {
            if (confirm(`¿Quieres probar el plan ${plan.name}?`)) {
              await selectPlan(plan.id, token);
            }
          });
        }
      } else {
        button.textContent = 'Seleccionar Plan';
        button.addEventListener('click', async () => {
          if (token != null) {
            if (confirm(`¿Quieres probar el plan ${plan.name}?`)) {
              await selectPlan(plan.id, token);
            }
          } else {
            if (confirm(`Confirma que quieres el plan ${plan.name}`)) {
              localStorage.setItem('plan_id', plan.id, true);
              if (plan.price == 0) {
                window.location.href = '/short-register.html';
              } else {
                window.location.href = '/register.html';
              }
            }
          }
        });
      }
    }

    card.appendChild(button);
    container.appendChild(card);
  });
}
