export async function paypalRentPayment(movieId, token) {
  try {
    const body = {
      data: {
        movieId: movieId,
      }
    };

    const response = await fetch(
      '/api/paypal/rent/create',
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
    if (data.approval_url) {
      window.location.href = data.approval_url;
    } else {
      alert('Error iniciando el pago');
    }

  } catch (error) {
    console.log(error);
  }
}
