const token = localStorage.getItem('auth_token');

async function iniciarPago() {
  const body = {
    amount: {
      currency: 'EUR',
      value: '99.99',
    },
    items: [
      {
        name: 'Curso Laravel',
        description: 'Curso avanzado de Laravel',
        unit_amount: '99.99',
        quantity: 1,
      },
    ],
  };

  const response = await fetch(
    'https://7689af6dd61d.ngrok-free.app/api/paypal/create',
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
}

document.querySelector('.button').addEventListener('click', iniciarPago);
