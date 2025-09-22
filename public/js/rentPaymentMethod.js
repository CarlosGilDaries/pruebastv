import { processRedsysPayment } from './modules/redsys.js';
import { paypalRentPayment } from './modules/paypalRent.js';
import { showSpinner } from './modules/spinner.js';
import { hideSpinner } from './modules/spinner.js';


const token = localStorage.getItem('auth_token');
const movieId = sessionStorage.getItem('movie_id');
const paypal = document.querySelector('.paypal-btn');
const redsys = document.querySelector('.redsys-btn');

async function chooseMethod() {
  redsys.addEventListener('click', async function () {
    showSpinner();
    setTimeout(() => {
      hideSpinner();
    }, 4000);
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
    showSpinner();
    setTimeout(() => {
      hideSpinner();
    }, 4000);
    paypal.disabled = true;
    redsys.disabled = true;
    await paypalRentPayment(movieId, token);
  });
}

chooseMethod();
