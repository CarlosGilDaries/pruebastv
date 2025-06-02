import { processRedsysPayment } from './modules/redsys.js';

const token = localStorage.getItem('auth_token');
let userData;

try {
  const response = await fetch('/api/plans');

  const data = await response.json();

  if (data.success) {
    const plans = data.plans;
    displayPlans(plans);
  }

  function displayPlans(plans) {
    const container = document.getElementById('plans-container');
    container.innerHTML = ''; // Limpiar contenedor antes de agregar planes

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

      button.textContent = 'Seleccionar Plan';
        button.addEventListener('click', async () => {
            if (confirm(`¿Quieres probar el plan ${plan.name}?`)) {
              localStorage.setItem('plan_id', plan.id);
              if (plan.price == 0) {
                window.location.href = '/short-register.html';
              } else {
                  window.location.href = '/register.html';
              }
            }
      });

      card.appendChild(button);
      container.appendChild(card);
    });
  }
} catch (error) {
  console.log(error);
}

/*async function selectPlan(planId) {
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
}*/
