const token = localStorage.getItem('auth_token');
const backendApi = 'https://pruebastv.kmc.es/api/';

try {
  const response = await fetch(backendApi + 'plans');
  const userResponse = await fetch(backendApi + 'user', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  const userData = await userResponse.json();
  if (userData.success && data.success && userData.data.plan != null) {
    const plans = data.plans;
    const actualPlan = userData.data.plan.name;
    displayPlans(plans, actualPlan);
  } else if (data.success) {
    const plans = data.plans;
    displayPlans(plans);
  }
} catch (error) {
  console.error('Error en la solicitud:', error);
}

function displayPlans(plans, actualPlan) {
  const container = document.getElementById('plans-container');

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

    if (plan.name != actualPlan) {
      card.innerHTML = `
            ${adsBadge}
            <div class="plan-name">${plan.name}</div>
            <div class="plan-price">${formattedPrice}</div>
            <div class="plan-features">
                <div class="plan-feature">
                    <i class="fas fa-laptop"></i> ${
                      plan.max_devices
                    } dispositivo${plan.max_devices > 1 ? 's' : ''}
                </div>
                <div class="plan-feature">
                    <i class="fas fa-play"></i> ${
                      plan.max_streams
                    } transmisión${
        plan.max_streams > 1 ? 'es' : ''
      } simultánea${plan.max_streams > 1 ? 's' : ''}
                </div>
                <div class="plan-feature">
                    <i class="fas fa-${plan.ads ? 'ad' : 'ban'}"></i> ${
        plan.ads ? 'Con anuncios' : 'Sin anuncios'
      }
                </div>
            </div>
            <button class="plan-button" id="${
              plan.id
            }">Seleccionar Plan</button>
        `;
    } else {
      card.innerHTML = `
            ${adsBadge}
            <div class="plan-name">${plan.name}</div>
            <div class="plan-price">${formattedPrice}</div>
            <div class="plan-features">
                <div class="plan-feature">
                    <i class="fas fa-laptop"></i> ${
                      plan.max_devices
                    } dispositivo${plan.max_devices > 1 ? 's' : ''}
                </div>
                <div class="plan-feature">
                    <i class="fas fa-play"></i> ${
                      plan.max_streams
                    } transmisión${
        plan.max_streams > 1 ? 'es' : ''
      } simultánea${plan.max_streams > 1 ? 's' : ''}
                </div>
                <div class="plan-feature">
                    <i class="fas fa-${plan.ads ? 'ad' : 'ban'}"></i> ${
        plan.ads ? 'Con anuncios' : 'Sin anuncios'
      }
                </div>
            </div>
            <button class="plan-button" id="${
              plan.id
            }" disabled style="background-color: #10b981 !important; cursor: auto;">Plan Actual</button>
        `;
    }

    container.appendChild(card);
  });

  document.querySelectorAll('.plan-button').forEach((button) => {
    button.addEventListener('click', async function () {
      const planId = this.id;
      await selectPlan(planId);
    });
  });
}

async function selectPlan(planId) {
  try {
    const response = await fetch(backendApi + 'select-plan', {
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
      return;
      console.log(data);
    } else if (data.success && !data.payment_required) {
      window.location.href = '/';
    } else {
      console.log('Else');
    }
  } catch (error) {
    console.log(error);
    alert(error);
  }
}

async function processRedsysPayment(redsysData) {
  try {
    // Crear formulario oculto
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://sis-t.redsys.es:25443/sis/realizarPago'; // URL de prueba

    // Agregar campos requeridos
    const addHiddenField = (name, value) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    // Campos básicos de Redsys
    addHiddenField('Ds_SignatureVersion', 'HMAC_SHA256_V1');
    addHiddenField('Ds_MerchantParameters', redsysData.Ds_MerchantParameters);
    addHiddenField('Ds_Signature', redsysData.Ds_Signature);

    // Agregar formulario al DOM y enviar
    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error('Error al procesar pago:', error);
  }
}