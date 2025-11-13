import { getIp } from './modules/getIp.js';
import { logOut } from './modules/logOut.js';
import { loadAds } from './modules/loadAds.js';
import { initAdPlayer } from './modules/adPlayer.js';
import { signedUrl } from './modules/signedUrl.js';
import { setupBackArrowAndTitle } from './modules/backArrowAndTitle.js';
import { VideoProgressTracker } from './modules/videoProgressTrackerClass.js';
import { hasStarted, hasEnded } from './modules/compareDateTime.js';
import { setGoogleAnalyticsScript } from './modules/setScripts.js';

async function initPlayer() {
  try {
    const pathParts = window.location.pathname.split('/');
    const movieSlug = pathParts[pathParts.length - 1];
    const api = 'https://pruebastv.kmc.es/api/';
    const apiShow = `/api/content/${movieSlug}`;
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

    setGoogleAnalyticsScript(showData.data.movie.scripts);

    let location;
    if (
      showData.data.movie.seo_setting &&
      showData.data.movie.seo_setting.url
    ) {
      location = showData.data.movie.seo_setting.url;
    } else {
      location = `/contenido/${showData.data.movie.slug}`;
    }

    const userResponse = await fetch(`/api/user`, {
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
      .filter((plan) => plan.name !== 'Admin')
      .map((plan) => plan.name);

    if (!userData.data.plan) {
      sessionStorage.setItem('needed_plans', neededPlans);
      window.location.href = '/manage-plans.html';
      return;
    }

    const actualPlan = userData.data.plan.name;
    if (!neededPlans.includes(actualPlan) && actualPlan !== 'Admin') {
      sessionStorage.setItem('actual_plan', actualPlan);
      sessionStorage.setItem('needed_plans', neededPlans);
      window.location.href = '/manage-plans.html';
      return;
    }

    if (
      showData.data.movie.pay_per_view &&
      userData.data.user.rol !== 'admin'
    ) {
      const ppvResponse = await fetch(
        `/api/ppv-current-user-order/${movieId}`,
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
        window.location.href = location;
        return;
      }
    }

    if (
      showData.data.movie.rent &&
      userData.data.user.rol !== 'admin'
    ) {
      const rentResponse = await fetch('/api/check-if-rented/' + movieId, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const rentData = await rentResponse.json();

      if (!rentData.success && rentResponse.status == 404) {
        window.location.href = location;
        return;
      }
    }

    if (showData.data.movie.start_time) {
      if (!hasStarted(showData.data.movie.start_time)) {
        window.location.href = location;
        return;
      }
      if (hasEnded(showData.data.movie.end_time)) {
        const response = await fetch(
          `/api/movie-progress/${showData.data.movie.id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        window.location.href = location;
        return;
      }
    }

    const url = await signedUrl(token, showData.data.movie.id);

    if (showData.data.ads_count === 0) {
      await playVideoWithoutAds(showData.data.movie, token, url);
    } else {
      await playVideoWithAds(movieSlug, token, showData.data.movie);
    }

    const viewedResponse = await fetch(
      `/api/add-viewed/${showData.data.movie.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const viewedData = await viewedResponse.json();
    if (viewedData.success) {
    } else {
      console.log(viewedData);
    }
  } catch (error) {
    console.error('Error en la inicialización del reproductor:', error);
  }
}

async function playVideoWithoutAds(movie, token, signedUrl) {
  try {
    let videoUrl = movie.url;
    let type = movie.type;
    let techOrder = 'html5';

    document.title = movie.title;
/*
    if (type === 'iframe') {
      const video = document.querySelector('video');
      if (video) video.remove();
      console.log(urlData.url);

      const container = document.getElementById('iframe-container');
      container.style.display = 'flex';
      container.innerHTML = `
									<iframe
										  id="iframe-without-ads"
										  src="${movie.url}" 
										  frameborder="0" 
										  allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope" 
										  allowfullscreen>
									</iframe>;
									`;
      return;
    }
*/
    if (type === 'stream') {
      videoUrl = signedUrl;
      type = 'application/vnd.apple.mpegurl';
    } else if (type === 'url_mp4') {
      videoUrl = signedUrl;
      type = 'video/mp4';
    } else if (type === 'url_mp3') {
      videoUrl = signedUrl;
      type = 'audio/mpeg';
    } else if (type === 'url_hls') {
      videoUrl = signedUrl;
      type = 'application/vnd.apple.mpegurl';
    } else if (type == 'application/vnd.apple.mpegurl') {
      videoUrl = signedUrl;
    }

    if (type === 'audio/mpeg') {
      videoUrl = signedUrl;
      const playerElement = document.querySelector('.video-js');
      if (playerElement) {
        playerElement.style.backgroundImage = `url('${movie.cover}')`;
        playerElement.style.backgroundSize = 'cover';
        playerElement.style.backgroundPosition = 'center';
      }
    }

    const player = videojs('my-video', {
      techOrder: [techOrder],
      sources: [
        {
          src: videoUrl,
          type: type,
          withCredentials: true,
        },
      ],
      html5: {
        hls: {
          withCredentials: true, // Para HLS
        },
      },
    });

    new VideoProgressTracker(movie.id, player, token);
    setupBackArrowAndTitle(player, movie);
    player.play();
  } catch (error) {
    console.log(error);
  }
}

async function playVideoWithAds(movieSlug, token, movie) {
  try {
    const { movie: movieData, ads } = await loadAds(movieSlug, token);

    if (movieData.type != 'iframe') {
      const player = videojs('my-video', {}, async function () {
        const savedTime = await this.getSavedProgress(movieData.id, token);

        await initAdPlayer(
          player,
          movieData.url,
          movieData.type,
          ads,
          movieData.id,
          token,
          savedTime
        );
        new VideoProgressTracker(movieData.id, player, token);
      });

      player.getSavedProgress = async (movieId, token) => {
        try {
          const response = await fetch(`/api/movie-progress/${movieId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          return response.ok ? await response.json() : 0;
        } catch (error) {
          console.error('Error fetching progress:', error);
          return 0;
        }
      };

      setupBackArrowAndTitle(player, movieData);
    }
  } catch (error) {
    console.error('Error al cargar anuncios:', error);
  }
}

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
