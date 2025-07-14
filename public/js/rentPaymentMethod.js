import { processRedsysPayment } from './modules/redsys.js';
import { paypalRentPayment } from './modules/paypalRent.js';

const token = localStorage.getItem('auth_token');
const movieId = localStorage.getItem('movie_id');
const paypal = document.querySelector('.paypal-btn');
const redsys = document.querySelector('.redsys-btn');

async function chooseMethod() {
  redsys.addEventListener('click', async function () {
    paypal.disabled = true;
    redsys.disabled = true;
    const paymentResponse = await fetch('/api/rent-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content_id: movieId,
      }),
    });

    const paymentData = await paymentResponse.json();

    if (paymentData.success && paymentData.payment_required) {
      await processRedsysPayment(paymentData);
      return;
    }
  });

  paypal.addEventListener('click', async function () {
    paypal.disabled = true;
    redsys.disabled = true;
    await paypalRentPayment(movieId, token);
  });
}

chooseMethod();
