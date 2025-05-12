import { getIp } from './modules/getIp.js';
import { logOut } from './modules/logOut.js';
import { processRedsysPayment } from './modules/redsys.js';
const token = localStorage.getItem('auth_token');

if (token == null) {
  window.location.href = '/login';

}
const pathParts = window.location.pathname.split('/');
const movieSlug = pathParts[pathParts.length - 1]; // Extraer el último segmento de la URL
const api = 'https://pruebastv.kmc.es/api/';
const backendURL = 'https://pruebastv.kmc.es';
const play = document.getElementById('play-button');
const email = localStorage.getItem('current_user_email');
const device_id = localStorage.getItem('device_id_' + email);
const ip = await getIp();
const userAgent = navigator.userAgent;

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

    const data = await response.json();
    const userData = await userResponse.json();
	const movieId = data.data.movie.id;
	  
	let neededPlans = [];
	data.data.plans.forEach(plan => {
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
		const ppvResponse = await fetch(api + 'ppv-current-user-order/' + movieId, {
		  method: 'GET',
		  headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		  },
		});
		
		const ppvData = await ppvResponse.json();
		
		if (!ppvData.success) {
			document.getElementById('play-button').textContent = 'Pagar para ver: ' +  data.data.movie.pay_per_view_price + ' €';
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
					  } else {
						  console.log('Else');
					  }
				  } catch (error) {
					  console.log(error);
					  alert(error);
				  }
      		});
		} else {
			document.getElementById('play-button').innerHTML = '&#11208; Ver Ahora';
		
		    play.addEventListener('click', function () {
        		window.location.href = `/player/${movieSlug}`;
      		});
		}
	} else {
			document.getElementById('play-button').innerHTML = '&#11208; Ver Ahora';
		
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
        trailer.src = '/video/background-loop.mp4';
      }
      image.src = backendURL + data.data.movie.cover;
      title.innerHTML = data.data.movie.title;
      document.title = data.data.movie.title + ' - Streaming';

    } else {
      console.error('Error al consultar la API: ', data.message);
    }
  } catch (error) {
    console.log(error);
  }
}

fetchMovieData();
