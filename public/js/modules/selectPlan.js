import { processRedsysPayment } from "./redsys.js";

export async function selectPlan(planId, token, months = 0, register = false,) {
  try {
    const response = await fetch('/api/select-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        register: register,
        months: months
      }),
    });

    const data = await response.json();

    if (data.success && data.payment_required) {
      await processRedsysPayment(data);
    } else if (data.success && !data.payment_required) {
      if (data.require_device_registration) {
        window.location.href = '/new-device.html';
      } else {
        window.location.href = '/';
      }
    } else {
      console.error('Error al seleccionar plan:', data.message);
      alert('Error al seleccionar el plan. Por favor, inténtalo de nuevo.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Ocurrió un error al procesar tu solicitud.');
  }
}
