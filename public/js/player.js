import { getIp } from './modules/getIp.js';
import { logOut } from './modules/logOut.js';
import { loadAds } from './modules/loadAds.js';
import { initAdPlayer } from './modules/adPlayer.js';
import { signedUrl } from './modules/signedUrl.js';


async function initPlayer() {
	try {
		const pathParts = window.location.pathname.split('/');
		const movieSlug = pathParts[pathParts.length - 1];
		const api = 'https://pruebastv.kmc.es/api/';
		const apiShow = `https://pruebastv.kmc.es/api/content/${movieSlug}`;
		const apiAds = 'https://pruebastv.kmc.es/api/ads/';
		const backendURL = 'https://pruebastv.kmc.es';

		const token = localStorage.getItem('auth_token');
		if (!token) {
			window.location.href = '/login';
			return;
		}

		const email = localStorage.getItem('current_user_email');
		const device_id = localStorage.getItem(`device_id_${email}`);
		const ip = await getIp();
		const userAgent = navigator.userAgent;

		if (!device_id) {
			await logOut(token);
			return;
		}

		// Fetch show data
		const showResponse = await fetch(apiShow, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'User-Device-ID': device_id,
				'User-Ip': ip,
				'User-Agent': userAgent,
				Authorization: `Bearer ${token}`,
			},
		});

		const showData = await showResponse.json();
		if (!showData.success) {
			console.error('Error al obtener el video:', showData.message);
			return;
		}

		const userResponse = await fetch(`${api}user`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		const userData = await userResponse.json();
		if (!userData.success) {
			console.error('Error al obtener datos del usuario:', userData.message);
			return;
		}

		const movieId = showData.data.movie.id;
		const neededPlans = showData.data.plans
		.filter(plan => plan.name !== 'Admin')
		.map(plan => plan.name);

		if (!userData.data.plan) {
			localStorage.setItem('needed_plans',neededPlans);
			window.location.href = '/manage-plans.html';
			return;
		}

		const actualPlan = userData.data.plan.name;
		if (!neededPlans.includes(actualPlan) && actualPlan !== 'Admin') {
			localStorage.setItem('actual_plan', actualPlan);
			localStorage.setItem('needed_plans',neededPlans);
			window.location.href = '/manage-plans.html';
			return;
		}

		if (showData.data.movie.pay_per_view && userData.data.user.rol !== 'admin') {
			const ppvResponse = await fetch(`${api}ppv-current-user-order/${movieId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});

			const ppvData = await ppvResponse.json();
			if (!ppvData.success) {
				window.location.href = `/${showData.data.movie.slug}`;
				return;
			}
		}

		const url = await signedUrl(token, showData.data.movie.id);

		if (showData.data.ads_count === 0) {
			await playVideoWithoutAds(showData.data.movie, backendURL, token, url);
		} else {
			await playVideoWithAds(movieSlug, apiAds, token, showData.data.movie);
		}
	} catch (error) {
		console.error('Error en la inicialización del reproductor:', error);
	}
}

async function playVideoWithoutAds(movie, backendURL, token, signedUrl) {
	try {
		let videoUrl = backendURL + movie.url;
		let type = movie.type;
		let techOrder = 'html5';

		document.title = movie.title;

		if (type === 'iframe') {
			const video = document.querySelector('video');
			if (video) video.remove();
			console.log(urlData.url);

			const container = document.getElementById('iframe-container');
			container.style.display = "flex";
			container.innerHTML = `
									<iframe
										  id="iframe-without-ads"
										  src="${movie.url}" 
										  frameborder="0" 
										  allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope" 
										  allowfullscreen>
									</iframe>;
									`
			return;
		}

		if (type === 'video/youtube') {
			videoUrl = signedUrl;
			techOrder = 'youtube';
		} else if (type === 'url_mp4') {
			videoUrl = signedUrl;
			type = 'video/mp4';
		} else if (type === 'url_hls') {
			videoUrl = signedUrl;
			type = 'application/vnd.apple.mpegurl';
		}

		if (type === 'audio/mpeg') {
			const playerElement = document.querySelector('.video-js');
			if (playerElement) {
				playerElement.style.backgroundImage = `url('${backendURL + movie.cover}')`;
				playerElement.style.backgroundSize = 'cover';
				playerElement.style.backgroundPosition = 'center';
			}
		}

		const player = videojs('my-video', {
			techOrder: [techOrder],
			sources: [{
				src: videoUrl,
				type: type
			}]
		});

		player.play();

	} catch (error) {
		console.log(error);
	}
}

async function playVideoWithAds(movieSlug, apiAds, token, movie) {
	try {
		const { movie: movieData, ads } = await loadAds(movieSlug, apiAds, token);

		if (movieData.type != 'iframe') {
			const player = videojs('my-video', {}, async function () {
				await initAdPlayer(
					player,
					movieData.url,
					'https://pruebastv.kmc.es',
					movieData.type,
					ads,
					movieData.id,
					token
				);
			});
		} else {
		}
	} catch (error) {
		console.error('Error al cargar anuncios:', error);
	} 
}

// Initialize the player
document.addEventListener('DOMContentLoaded', initPlayer);
/*
document.addEventListener('contextmenu', function (event) {
  event.preventDefault();
})

document.addEventListener('keydown', function (event) {
  if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J')) || (event.ctrlKey && event.key === 'U')) {
    event.preventDefault();
  }
});
*/