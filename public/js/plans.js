import { selectPlan } from './modules/selectPlan.js';
import { applyTranslations } from './translations.js';
import { aceptedCookies } from './modules/acceptedCookies.js';

const token = localStorage.getItem('auth_token');
const backendApi = 'https://pruebastv.kmc.es/api/';
const neededPlans = sessionStorage.getItem('needed_plans');
const currentLanguage = localStorage.getItem('userLocale');
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
    console.log(userData.data.plan.plan_order);
    const msDiff = expirationDate - now;
    const hoursLeft = msDiff / (1000 * 60 * 60);
    const canRenew = hoursLeft <= 48;

    const plans = data.plans;
    const actualPlan = userData.data.plan.name;
    const actualPlanOrder = userData.data.plan.plan_order;
    displayPlans(plans, actualPlan, canRenew, actualPlanOrder);
  } else if (
    token != null &&
    userData.success &&
    data.success &&
    userData.data.plan == null
  ) {
    const plans = data.plans;
    displayPlans(plans, null);
  } else if (token != null && userData.success && userData.data.plan == null && userData.data.user.free_available == 0) {
    const plans = data.plans;
    displayPlans(plans, null);
    const freeButton = document.querySelector('.free-button');
    if (freeButton) {
      freeButton.setAttribute('data-i18n', 'not_available_button');
      freeButton.innerHTML = 'No Disponible';
      freeButton.classList.add('disabled-plan');
      freeButton.disabled = true;
    }
  } else if (token != null && userData.success && userData.data.plan == null && userData.data.user.free_available == 1) {

  } else if (data.success) {
    const plans = data.plans;
    displayPlans(plans, null);
  }

  window.addEventListener('beforeunload', function () {
    sessionStorage.removeItem('needed_plans');
  });
} catch (error) {
  console.error('Error en la solicitud:', error);
}

function displayPlans(plans, actualPlan, canRenew, actualPlanOrder) {
  const main = document.querySelector('.main');
  const container = document.getElementById('plans-container');
  container.innerHTML = ''; // Limpiar contenedor antes de agregar planes
  const title = document.createElement('h1');
  title.innerHTML =
    '<span data-i18n="choose_plan">Elige uno de nuestros planes</span>';
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
    let price = '';
    if (plan.trimestral_price == 0) {
      price = `<div class="plan-feature" data-i18n="free">Gratis</div>`;
    } else {
      price = `<div class="plan-feature">
            <span data-i18n="quarterly_price">Precio trimestral</span>: ${plan.trimestral_price} €
          </div>
          <div class="plan-feature">
            <span data-i18n="annual_price">Precio anual</span>: ${plan.anual_price} €
          </div>`;
    }

    card.innerHTML = `
      <div class="plan-name">${plan.name}</div>
      <div class="plan-features">
          ${price}
          <div class="plan-feature">
          ${plan.max_devices}&nbsp;<span data-i18n="device${
      plan.max_devices > 1 ? 's' : ''
    }">dispositivo${plan.max_devices > 1 ? 's' : ''}</span>
          </div>
          <div class="plan-feature">
          ${plan.max_streams}&nbsp;<span data-i18n="screen${
      plan.max_streams > 1 ? 's' : ''
    }">pantalla${plan.max_streams > 1 ? 's' : ''}</span>
          </div>
          <div class="plan-feature">
            ${
              plan.ads
                ? '<span data-i18n="with_ads">Con anuncios</span>'
                : '<span data-i18n="without_ads">Sin anuncios</span>'
            }
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
          button.innerHTML =
            '<span data-i18n="current_plan">Plan Actual</span>';
          button.classList.add('actual-plan', 'free-button');
          button.disabled = true;
        } else if (userData.data.suscription == 'anual') {
          button2.innerHTML =
            '<span data-i18n="renew_current_plan">Renovar Plan Actual</span>';
          button2.classList.add('actual-plan');
          button2.addEventListener('click', async () => {
            if (canRenew) {
              if (checkOrder(plan.plan_order, actualPlanOrder)) {
                choosePlan(plan.id, button2.value);
              }
            } else {
              alert(
                'Para poder renovar, el plan debe expirar en 48 horas o menos.'
              );
            }
          });
          button.classList.add('needed-plan');
          button.innerHTML = `${plan.name} <span data-i18n="quarterly">Trimestral</span>`;
          button.addEventListener('click', async () => {
            if (checkOrder(plan.plan_order, actualPlanOrder)) {
              choosePlan(plan.id, button.value);
            }
          });
        } else if (userData.data.suscription == 'trimestral') {
          button.innerHTML =
            '<span data-i18n="renew_current_plan">Renovar Plan Actual</span>';
          button.classList.add('actual-plan');
          button.addEventListener('click', async () => {
            if (canRenew) {
              if (checkOrder(plan.plan_order, actualPlanOrder)) {
                choosePlan(plan.id, button.value);
              }
            } else {
              alert(
                'Para poder renovar, el plan debe expirar en 48 horas o menos.'
              );
            }
          });
          button2.innerHTML = `${plan.name} <span data-i18n="annual">Anual</span>`;
          button2.classList.add('needed-plan');
          button2.addEventListener('click', async () => {
            if (checkOrder(plan.plan_order, actualPlanOrder)) {
              choosePlan(plan.id, button2.value);
            }
          });
        }
      } else {
        if (plan.trimestral_price == 0) {
          button.classList.add('free-button');
        }
      }
      if (neededPlans && !neededPlans.includes(plan.name)) {
        button.innerHTML = '<span data-i18n="not_applicable">No aplica</span>';
        button.disabled = true;
        button.classList.add('disabled-plan');
        if (plan.trimestral_price != 0) {
          button2.innerHTML =
            '<span data-i18n="not_applicable">No aplica</span>';
          button2.disabled = true;
          button2.classList.add('disabled-plan');
        }
      } else {
        if (plan.trimestral_price != 0 && actualPlan != plan.name) {
          button.innerHTML = `${plan.name} <span data-i18n="quarterly">Trimestral</span>`;
          button2.innerHTML = `${plan.name} <span data-i18n="annual">Anual</span>`;
        } else if (plan.trimestral_price == 0) {
          if (actualPlan != plan.name) {
            button.textContent = `${plan.name}`;
          }
          button.classList.add('free-button');
        }
        button.classList.add('needed-plan');
        if (actualPlan != plan.name) {
          button.addEventListener('click', async () => {
            if (plan.trimestral_price == 0) {
              await selectPlan(plan.id, token, button.value);
            } else {
              if (checkOrder(plan.plan_order, actualPlanOrder)) {
                choosePlan(plan.id, button.value);
              }
            }
          });
          button2.classList.add('needed-plan');
          button2.addEventListener('click', async () => {
            if (checkOrder(plan.plan_order, actualPlanOrder)) {
              choosePlan(plan.id, button2.value);
            }
          });
        }
      }
    } else {
      if (neededPlans) {
        if (!neededPlans.includes(plan.name)) {
          button.innerHTML =
            '<span data-i18n="not_applicable">No aplica</span>';
          button.disabled = true;
          button.classList.add('disabled-plan');
          button2.innerHTML =
            '<span data-i18n="not_applicable">No aplica</span>';
          button2.disabled = true;
          button2.classList.add('disabled-plan');
        } else {
          if (plan.trimestral_price != 0) {
            button.innerHTML = `${plan.name} <span data-i18n="quarterly">Trimestral</span>`;
            button2.innerHTML = `${plan.name} <span data-i18n="annual">Anual</span>`;
          } else {
            button.textContent = `${plan.name}`;
            button.classList.add('free-button');
          }
          button.classList.add('needed-plan');
          button.addEventListener('click', async () => {
            if (plan.trimestral_price == 0) {
              if (checkOrder(plan.plan_order, actualPlanOrder)) {
                await selectPlan(plan.id, token, button.value);
              }
            } else {
              if (checkOrder(plan.plan_order, actualPlanOrder)) {
                choosePlan(plan.id, button.value);
              }
            }
          });
          button2.classList.add('needed-plan');
          button2.addEventListener('click', async () => {
            if (checkOrder(plan.plan_order, actualPlanOrder)) {
              choosePlan(plan.id, button2.value);
            }
          });
        }
      } else {
        if (plan.trimestral_price != 0) {
          button.innerHTML = `${plan.name} <span data-i18n="quarterly">Trimestral</span>`;
          button.classList.add('needed-plan');
          button2.innerHTML = `${plan.name} <span data-i18n="annual">Anual</span>`;
          button2.classList.add('needed-plan');
        } else {
          button.textContent = `${plan.name}`;
          button.classList.add('needed-plan', 'free-button');
        }
        button.addEventListener('click', async () => {
          if (token != null) {
            if (plan.trimestral_price == 0) {
              if (checkOrder(plan.plan_order, actualPlanOrder)) {
                choosePlan(plan.id, button.value);
              }
            } else {
              if (checkOrder(plan.plan_order, actualPlanOrder)) {
                choosePlan(plan.id, button.value);
              }
            }
          } else {
            if (plan.trimestral_price == 0) {
              sessionStorage.setItem('plan_id', plan.id);
              window.location.href = '/short-register.html';
            } else {
              sessionStorage.setItem('plan_id', plan.id);
              sessionStorage.setItem('months', 3);
              window.location.href = '/register.html';
            }
          }
        });

        button2.addEventListener('click', async () => {
          if (token != null) {
            choosePlan(plan.id, button2.value);
          } else {
            sessionStorage.setItem('plan_id', plan.id);
            sessionStorage.setItem('months', 12);
            window.location.href = '/register.html';
          }
        });
      }
    }

    card.appendChild(button);
    if (button2.textContent != '') {
      card.appendChild(button2);
    }
    container.appendChild(card);

    if (actualPlan && plan.name == actualPlan && plan.trimestral_price != 0) {
      const freeButton = document.querySelector('.free-button');
      freeButton.classList.add('disabled-plan');
      freeButton.disabled = true;
    }
  });
}

function choosePlan(planId, buttonValue) {
  sessionStorage.setItem('plan_id', planId);
  sessionStorage.setItem('months', buttonValue);
  window.location.href = '/payment-method.html';
  return;
}

function checkOrder(planOrder, actualPlanOrder = null) {
  console.log(actualPlanOrder);
  if (actualPlanOrder != null && planOrder < actualPlanOrder) {
    if (confirm('El plan al que intentas acceder es inferior al plan que ya tienes (perderás privilegios si lo adquieres).')) {
      return true;
    } else {
      return false;
   }
  } else {
    return true;
 }
}

if (typeof applyTranslations === 'function') {
  applyTranslations(currentLanguage);
}

aceptedCookies();