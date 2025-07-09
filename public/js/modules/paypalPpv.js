export async function paypalPpvPayment(movieId, token) {
  try {
    const body = {
      data: {
        movieId: movieId,
      }
    };

    const response = await fetch(
      'https://2591dce456a7.ngrok-free.app/api/paypal/ppv/create',
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
