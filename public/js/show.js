import { getIp } from './modules/getIp.js';
import { logOut } from './modules/logOut.js';
import { hasEnded, hasStarted } from './modules/compareDateTime.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { formatDuration } from './modules/formatDuration.js';
import { renderSimilars } from './modules/renderSimilars.js';
import { clickLogOut } from './modules/clickLogOutButton.js';
import { applyTranslations } from './translations.js';

const token = localStorage.getItem('auth_token');

if (token == null) {
  window.location.href = '/login';
}

clickLogOut();

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
const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');
const startTimeContainer = document.querySelector('.start-time-container');
const startTimeDateTime = document.getElementById('date-time-text');
const startTimeText = document.getElementById('start-time-text');

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

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
    // Cargar el idioma actual primero
    const currentLanguage = localStorage.getItem('userLocale') || 'es';

    const response = await fetch('/api/content/' + movieSlug, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Device-ID': device_id,
        'User-Ip': ip,
        'User-Agent': userAgent,
        Authorization: `Bearer ${token}`,
      },
    });

    const userResponse = await fetch('/api/user', {
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

    if (data.redirect_url) {
      window.location.href = data.redirect_url;
    }

    const tags = data.data.movie.tags;
    const tagsContainer = document.querySelector('.keyword-links');
    tags.forEach((tag) => {
      const link = document.createElement('a');
      link.href = `/tag-show.html?id=${tag.id}`;
      link.classList.add('keyword-link');
      link.setAttribute('data-i18n', `tag_${tag.id}`);
      link.innerHTML = tag.name;
      tagsContainer.appendChild(link);
    });

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
        localStorage.setItem('actual_plan', 'Ninguno');
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

      if (data.data.movie.rent && userData.data.user.rol != 'admin') {
        const rentResponse = await fetch('/api/check-if-rented/' + movieId, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const rentData = await rentResponse.json();

        if (!rentData.success && rentResponse.status == 404) {
          play.classList.add('rent-btn');
          play.textContent =
            `Alquilar ${data.data.movie.rent_days} días: ` +
            data.data.movie.rent_price +
            ' €';
          play.addEventListener('click', async function () {
            localStorage.setItem('movie_id', data.data.movie.id);
            window.location.href = '/rent-payment-method.html';
            return;
          });
        } else if (rentData.success) {
          play.innerHTML = 'Ver Ahora';

          play.addEventListener('click', function () {
            window.location.href = `/player/${movieSlug}`;
          });
        }
      }

      if (data.data.movie.pay_per_view && userData.data.user.rol != 'admin') {
        const ppvResponse = await fetch(
          '/api/ppv-current-user-order/' + movieId,
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
          play.classList.add('ppv-btn');
          play.textContent =
            'Pagar para ver: ' + data.data.movie.pay_per_view_price + ' €';
          play.addEventListener('click', async function () {
            localStorage.setItem('movie_id', data.data.movie.id);
            window.location.href = '/ppv-payment-method.html';
            return;
          });
        } else {
          play.innerHTML = 'Ver Ahora';

          play.addEventListener('click', function () {
            window.location.href = `/player/${movieSlug}`;
          });
        }
      } else {
        if (!data.data.movie.rent) {
          if (data.data.movie.start_time) {
            play.setAttribute(
              'data-i18n',
              `prueba`
            );
            if (!hasStarted(data.data.movie.start_time)) {
              play.innerHTML =
                dateTimeIntoDate(data.data.movie.start_time) +
                ' ' +
                dateTimeIntoTime(data.data.movie.start_time);
              play.classList.add('disabled-btn');
              startTimeContainer.style.display = 'block';
              startTimeText.innerHTML = 'El contenido no ha empezado todavía.';
              startTimeDateTime.innerHTML =
                'Fecha de inicio: ' +
                dateTimeIntoDate(data.data.movie.start_time) +
                ' a las ' +
                dateTimeIntoTime(data.data.movie.start_time);
            } else if (hasEnded(data.data.movie.end_time)) {
              const response = await fetch(
                `/api/movie-progress/${data.data.movie.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              play.innerHTML = 'Finalizado';
              play.classList.add('disabled-btn');
              startTimeContainer.style.display = 'block';
              startTimeContainer.classList.remove('d-none');
              startTimeText.innerHTML = 'El contenido ya ha terminado.';
              startTimeDateTime.innerHTML =
                'Fecha de fin: ' +
                dateTimeIntoDate(data.data.movie.end_time) +
                ' a las ' +
                dateTimeIntoTime(data.data.movie.end_time);
            } else if (
              hasStarted(data.data.movie.start_time) &&
              !hasEnded(data.data.movie.end_time)
            ) {
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
        }
      }

      const isFavorite = await isMovieFavorite(movieId);
      updateFavoriteButton(isFavorite);

      // Evento click al botón de favoritos
      document
        .getElementById('favorite-toggle')
        .addEventListener('click', async () => {
          const currentFavoriteStatus = await isMovieFavorite(movieId);
          const result = await toggleFavorite(movieId, currentFavoriteStatus);
          if (result.success) {
            updateFavoriteButton(!currentFavoriteStatus);
          }
        });

      const image = document.getElementById('content-image');
      const title = document.getElementById('content-title');
      title.setAttribute('data-i18n', `content_${data.data.movie.id}_title`);
      const trailer = document.getElementById('trailer');
      if (data.data.movie.trailer != null) {
        trailer.classList.add('fade-out');
        setTimeout(() => {
          trailer.src = data.data.movie.trailer;
          trailer.classList.remove('fade-out');
        }, 1500);
      }
      trailer.poster = data.data.movie.cover;
      image.src = data.data.movie.cover;
      title.textContent = data.data.movie.title;
      document.title = data.data.movie.title + ' - Pruebas TV';
      gender.textContent = data.data.movie.gender.name;
      gender.setAttribute('data-i18n', `gender_${data.data.movie.gender.id}`);
      gender.href = `/gender-show.html?id=${data.data.movie.gender_id}`;
      const taglineText = document.createElement('p');
      taglineText.innerHTML = data.data.movie.tagline;
      taglineText.setAttribute(
        'data-i18n',
        `content_${data.data.movie.id}_tagline`
      );
      tagline.appendChild(taglineText);
      duration.innerHTML = formatDuration(data.data.movie.duration);
      const overviewText = document.createElement('div'); // 🔄 CAMBIO AQUÍ
      overviewText.innerHTML = data.data.movie.overview;
      overviewText.setAttribute(
        'data-i18n',
        `content_${data.data.movie.id}_overview`
      );
      overview.appendChild(overviewText);
      console.log(data.data.movie.overview);

      renderSimilars(data.data.movie, token);

      if (typeof applyTranslations === 'function') {
        applyTranslations(currentLanguage);
      }

    } else {
      console.error('Error al consultar la API: ', data.message);
    }
  } catch (error) {
    console.log(error);
  }
}

fetchMovieData();

// Función para verificar si una película es favorita
async function isMovieFavorite(movieId) {
  try {
    const response = await fetch('/api/favorites', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
      return data.favorites.some(movie => movie.id === movieId);
  } catch (error) {
      console.error('Error al obtener favoritos:', error);
      return false;
  }
}

// Función para alternar favoritos
async function toggleFavorite(movieId, isCurrentlyFavorite) {
  try {
    const endpoint = isCurrentlyFavorite
      ? `/api/quit-favorite/${movieId}`
      : `/api/add-favorite/${movieId}`;

    const response = await fetch(`${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error al alternar favorito:', error);
    return { success: false };
  }
}

// Función para actualizar el estado visual del botón de favoritos
function updateFavoriteButton(isFavorite) {
  const favoriteToggle = document.getElementById('favorite-toggle');
  const farHeart = favoriteToggle.querySelector('.far');
  const fasHeart = favoriteToggle.querySelector('.fas');
  
  if (isFavorite) {
      farHeart.style.display = 'none';
      fasHeart.style.display = 'block';
      favoriteToggle.title = 'Quitar de favoritos';
  } else {
      farHeart.style.display = 'block';
      fasHeart.style.display = 'none';
      favoriteToggle.title = 'Añadir a favoritos';
  }
}

function dateTimeIntoDate(dateTime) {
  const fecha = new Date(dateTime.replace(' ', 'T'));

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes: 0 = enero
  const anio = fecha.getFullYear();

  const resultado = `${dia}/${mes}/${anio}`;

  return resultado;
}

function dateTimeIntoTime(dateTime) {
  const fecha = new Date(dateTime.replace(' ', 'T'));

  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');

  const resultado = `${horas}:${minutos}`;

  return resultado;
}
