import { getIp } from './modules/getIp.js';
import { logOut } from './modules/logOut.js';
import { processRedsysPayment } from './modules/redsys.js';
import { dropDownMenu } from './modules/dropDownMenu.js';
import { formatDuration } from './modules/formatDuration.js';
import { renderSimilars } from './modules/renderSimilars.js';

const token = localStorage.getItem('auth_token');

if (token == null) {
  window.location.href = '/login';
}
const pathParts = window.location.pathname.split('/');
const movieSlug = pathParts[pathParts.length - 1]; // Extraer el último segmento de la URL
const api = 'https://pruebastv.kmc.es/api/';
const backendURL = 'https://pruebastv.kmc.es';
const play = document.querySelector('.play-button');
const email = localStorage.getItem('current_user_email');
const device_id = localStorage.getItem('device_id_' + email);
const ip = await getIp();
const userAgent = navigator.userAgent;
const gender = document.getElementById('gender');
const tagline = document.getElementById('tagline');
const duration = document.getElementById('duration');
const overview = document.getElementById('overview-text');
const dropDown = document.querySelector('.dropdown-menu');
dropDownMenu(dropDown, api);

const menu = document.querySelector('.menu');

window.addEventListener('scroll', function () {
	if (window.scrollY > 1) {
		// Si se ha hecho scroll hacia abajo
		menu.classList.add('scrolled');
		document.body.style.paddingTop = '56px';
	} else {
		menu.classList.remove('scrolled');
		document.body.style.paddingTop = '0';
	}
});


if (device_id == null) {
	logOut(token);
}

async function fetchMovieData() {
  try {
    const response = await fetch(api + 'content/' + movieSlug, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Device-ID': device_id,
        'User-Ip': ip,
        'User-Agent': userAgent,
        Authorization: `Bearer ${token}`,
      },
    });

    const userResponse = await fetch(api + 'user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status == 404) {
      window.location.href = '/404.html';
    }

    const data = await response.json();
    const userData = await userResponse.json();
    const movieId = data.data.movie.id;

    let neededPlans = [];
    data.data.plans.forEach((plan) => {
      if (plan.name != 'Admin') {
        neededPlans.push(plan.name);
      }
    });

    if (userData.success && data.success) {
      if (userData.data.plan == null) {
        localStorage.setItem('needed_plans', neededPlans);
        window.location.href = '/manage-plans.html';
        return;
      }

      const actualPlan = userData.data.plan.name;

      if (!neededPlans.includes(actualPlan) && actualPlan != 'Admin') {
        localStorage.setItem('actual_plan', actualPlan);
        localStorage.setItem('needed_plans', neededPlans);
        window.location.href = '/manage-plans.html';
      }

      if (data.data.movie.pay_per_view && userData.data.user.rol != 'admin') {
        const ppvResponse = await fetch(
          api + 'ppv-current-user-order/' + movieId,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const ppvData = await ppvResponse.json();

        if (!ppvData.success) {
          play.textContent =
            'Pagar para ver: ' + data.data.movie.pay_per_view_price + ' €';
          play.addEventListener('click', async function () {
            try {
              const paymentResponse = await fetch(api + 'ppv-payment', {
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
            } catch (error) {
              console.log(error);
              alert(error);
            }
          });
        } else {
          play.innerHTML = 'Ver Ahora';

          play.addEventListener('click', function () {
            window.location.href = `/player/${movieSlug}`;
          });
        }
      } else {
        play.innerHTML = 'Ver Ahora';

        play.addEventListener('click', function () {
          window.location.href = `/player/${movieSlug}`;
        });
      }

      const image = document.getElementById('content-image');
      const title = document.getElementById('content-title');
      const trailer = document.getElementById('trailer');
      if (data.data.movie.trailer != null) {
        trailer.src = backendURL + data.data.movie.trailer;
      } else {
        trailer.poster = data.data.movie.cover;
      }
      image.src = backendURL + data.data.movie.cover;
      title.innerHTML = data.data.movie.title;
      document.title = data.data.movie.title + ' - Pruebas TV';
      gender.innerHTML = data.data.movie.gender.name;
      tagline.innerHTML = data.data.movie.tagline;
      duration.innerHTML = formatDuration(data.data.movie.duration);
      overview.innerHTML = data.data.movie.overview;
		renderSimilars(data.data.movie, api, backendURL, token);
		
    } else {
      console.error('Error al consultar la API: ', data.message);
    }
  } catch (error) {
    console.log(error);
  }
}

fetchMovieData();

const tabs = document.querySelectorAll('.tab');

tabs.forEach(tab => {
	tab.addEventListener('click', function() {
		document.querySelectorAll('.tab').forEach(t => {
			t.classList.remove('active')
		});
		document.querySelectorAll('.tab-content').forEach(c => {
			c.classList.remove('active')
		});

		const tabId = this.getAttribute('data-tab');
		document.getElementById(tabId).classList.add('active');
	});
});
