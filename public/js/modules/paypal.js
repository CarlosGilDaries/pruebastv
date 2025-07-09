export async function paypalPayment(planId, token, months = 0, register = false) {
  try {
    const body = {
      data: {
        planId: planId,
        months: months,
        register: register
      }
    };

    const response = await fetch(
      '/api/paypal/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    console.log(data);
    if (data.approval_url) {
      window.location.href = data.approval_url;
    } else {
      alert('Error iniciando el pago');
    }

  } catch (error) {
    console.log(error);
  }
}
