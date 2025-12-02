import { getIp } from './modules/getIp.js';
import { logOut } from './modules/logOut.js';
import { hasEnded, hasStarted } from './modules/compareDateTime.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { formatDuration } from './modules/formatDuration.js';
import { renderSimilars } from './modules/renderSimilars.js';
import { clickLogOut } from './modules/clickLogOutButton.js';
import { applyTranslations } from './translations.js';
import { resetFreeExpiration } from './modules/checkForFreeExpiration.js';
import { showSpinner } from './modules/spinner.js';
import { hideSpinner } from './modules/spinner.js';
import { setSeoSettings } from './modules/setSeoSettings.js';
import { setGoogleAnalyticsScript } from './modules/setScripts.js';
import { renderGridFilms } from './modules/renderRelatedFilms.js';
import { resourceUrl } from './modules/resourceUrl.js';

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
    showSpinner();
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
      window.location.href = '/pagina-no-encontrada';
    }

    const data = await response.json();

    if (data.redirect_url) {
      window.location.href = data.redirect_url;
    }

    const seoSettings = data.data.movie.seo_setting;
    if (seoSettings) {
      setSeoSettings(seoSettings);
    }
    const scripts = data.data.movie.scripts;
    setGoogleAnalyticsScript(scripts, null);

    if (data.data.movie.serie == 1) {
      showEpisodesTab(data.data.movie);
    }

    const tags = data.data.movie.tags;
    const tagsContainer = document.querySelector('.keyword-links');
    tags.forEach((tag) => {
      const link = document.createElement('a');
      if (tag.seo_setting && tag.seo_setting.url) {
        link.href = tag.seo_setting.url;
      } else {
        link.href = `/tag-show.html?id=${tag.id}`;
      }
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
        sessionStorage.setItem('actual_plan', 'Ninguno');
        sessionStorage.setItem('needed_plans', neededPlans);
        window.location.href = '/gestionar-planes';
        return;
      }

      const actualPlan = userData.data.plan.name;

      if (!neededPlans.includes(actualPlan) && actualPlan != 'Admin') {
        sessionStorage.setItem('actual_plan', actualPlan);
        sessionStorage.setItem('needed_plans', neededPlans);
        window.location.href = '/gestionar-planes';
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
          play.setAttribute('data-i18n', '');
          play.innerHTML =
            `<span data-i18n="rent_button_text">Alquilar</span> ${data.data.movie.rent_days} <span data-i18n="rent_button_days">días</span>: ` +
            data.data.movie.rent_price +
            ' €';
          play.addEventListener('click', async function () {
            sessionStorage.setItem('movie_id', data.data.movie.id);
            window.location.href = '/alquiler-metodo-de-pago';
            return;
          });
        } else if (rentData.success) {
          play.innerHTML = 'Ver Ahora';

          play.addEventListener('click', function () {
            window.location.href = resourceUrl(data.data.movie);
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
          play.setAttribute('data-i18n', '');
          play.innerHTML =
            `<span data-i18n="ppv_button_text">Pagar para ver</span>: ` +
            data.data.movie.pay_per_view_price +
            ' €';
          play.addEventListener('click', async function () {
            sessionStorage.setItem('movie_id', data.data.movie.id);
            window.location.href = '/ppv-metodo-de-pago';
            return;
          });
        } else {
          play.innerHTML = 'Ver Ahora';

          play.addEventListener('click', function () {
            window.location.href = resourceUrl(data.data.movie);
          });
        }
      } else {
        if (!data.data.movie.rent) {
          if (data.data.movie.start_time) {
            play.setAttribute('data-i18n', `prueba`);
            if (!hasStarted(data.data.movie.start_time)) {
              play.innerHTML =
                dateTimeIntoDate(data.data.movie.start_time) +
                ' ' +
                dateTimeIntoTime(data.data.movie.start_time);
              play.classList.add('disabled-btn');
              startTimeContainer.style.display = 'block';
              startTimeText.innerHTML =
                '<span data-i18n="not_started_yet">El contenido no ha empezado todavía.</span>';
              startTimeDateTime.innerHTML =
                '<span data-i18n="content_start_date">Fecha de inicio:</span> ' +
                dateTimeIntoDate(data.data.movie.start_time) +
                ' <span data-i18n="content_start_at">a las</span> ' +
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
              play.innerHTML = '<span data-i18n="play_button_ended">Finalizado</span>';
              play.classList.add('disabled-btn');
              startTimeContainer.style.display = 'block';
              startTimeContainer.classList.remove('d-none');
              startTimeText.innerHTML = '<span data-i18n="text_content_ended">El contenido ya ha terminado.</span>';
              startTimeDateTime.innerHTML =
                '<span data-i18n="content_end_date">Fecha de fin:</span> ' +
                dateTimeIntoDate(data.data.movie.end_time) +
                ' <span data-i18n="content_start_at">a las</span> ' +
                dateTimeIntoTime(data.data.movie.end_time);
            } else if (
              hasStarted(data.data.movie.start_time) &&
              !hasEnded(data.data.movie.end_time)
            ) {
              play.innerHTML = 'Ver Ahora';

              play.addEventListener('click', function () {
                window.location.href = resourceUrl(data.data.movie);
              });
            }
          } else {
            play.innerHTML = 'Ver Ahora';

            play.addEventListener('click', function () {
              window.location.href = resourceUrl(data.data.movie);
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
      gender.innerHTML = '';
      // Recorre todos los géneros
      data.data.movie.genders.forEach((g, index) => {
        // Crear enlace para cada género
        const a = document.createElement('a');
        a.textContent = g.name;
        a.setAttribute('data-i18n', `gender_${g.id}`);

        if (g.seo_setting && g.seo_setting.url) {
          a.href = g.seo_setting.url;
        } else {
          a.href = `/gender-show.html?id=${g.id}`;
        }

        // Insertar el enlace
        gender.appendChild(a);

        // Insertar separador " - " excepto en el último
        if (index < data.data.movie.genders.length - 1) {
          gender.appendChild(document.createTextNode(' - '));
        }
      });
      const taglineText = document.createElement('p');
      taglineText.innerHTML = data.data.movie.tagline;
      taglineText.setAttribute(
        'data-i18n',
        `content_${data.data.movie.id}_tagline`
      );
      tagline.appendChild(taglineText);
      duration.innerHTML = formatDuration(data.data.movie);
      const overviewText = document.createElement('div');
      overviewText.innerHTML = data.data.movie.overview;
      overviewText.setAttribute(
        'data-i18n',
        `content_${data.data.movie.id}_overview`
      );
      overview.appendChild(overviewText);

      renderSimilars(data.data.movie, token);

      if (typeof applyTranslations === 'function') {
        applyTranslations(currentLanguage);
      }
    } else {
      console.error('Error al consultar la API: ', data.message);
    }
  } catch (error) {
    console.log(error);
  } finally {
    hideSpinner();
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

if (token != null) {
  resetFreeExpiration(token);
}

function showEpisodesTab(content) {
  const episodesTab = document.getElementById('episodes-tab-li');
  const episodesContainer = document.getElementById('episodes');
  const episodesTabPane = document.getElementById('episodes-tab');

  // Mostrar pestaña Episodios
  episodesTab.classList.remove('d-none');

  const seasons = content.series_by_season;
  const numSeasons = seasons.length;

  // Limpia contenido previo
  episodesContainer.innerHTML = '';
  episodesTabPane.innerHTML = '';

  // ----------------------------------------------------
  // SI SOLO HAY UNA TEMPORADA → mostrar un grid normal
  // ----------------------------------------------------
  if (numSeasons === 1) {
    const seasonEpisodes = seasons[0];
    episodesTabPane.appendChild(episodesContainer);
    renderGridFilms(seasonEpisodes, episodesContainer, true);
    return;
  }

  // ----------------------------------------------------
  // SI HAY VARIAS TEMPORADAS → crear tabs dinámicas
  // ----------------------------------------------------

  // Crear contenedor de tabs
  const tabsId = 'seasonTabs';
  const contentId = 'seasonTabsContent';

  let tabsHtml = `
        <ul class="nav nav-tabs pt-0 border-0" id="${tabsId}" role="tablist">
    `;

  let tabsContentHtml = `
        <div class="tab-content" id="${contentId}">
    `;

  seasons.forEach((seasonEpisodes, index) => {
    const seasonNumber = seasonEpisodes[0].season_number;
    const activeClass = index === 0 ? 'active' : '';
    const showClass = index === 0 ? 'show active' : '';

    // Crear TAB
    tabsHtml += `
        <li class="tab nav-item" role="presentation">
            <button class="nav-link text-secondary fw-bold ${activeClass}"
                id="season-${seasonNumber}-tab"
                data-bs-toggle="tab"
                data-bs-target="#season-${seasonNumber}"
                type="button"
                role="tab">
                <span data-i18n="seasons_line">Temporada</span> ${seasonNumber}
            </button>
        </li>
    `;

    // Crear TAB CONTENT vacío
    tabsContentHtml += `
        <div class="tab-pane fade ${showClass}"
            id="season-${seasonNumber}"
            role="tabpanel"
            aria-labelledby="season-${seasonNumber}-tab">
        </div>
    `;
  });

  tabsHtml += `</ul>`;
  tabsContentHtml += `</div>`;

  // Insertar tabs en el contenedor principal
  episodesTabPane.innerHTML = tabsHtml + tabsContentHtml;

  // ─────────────────────────────────────────────
  // DESPUÉS DE INSERTARLOS EN EL DOM → rellenarlos
  // ─────────────────────────────────────────────

  seasons.forEach((seasonEpisodes) => {
    const seasonNumber = seasonEpisodes[0].season_number;
    const pane = document.getElementById(`season-${seasonNumber}`);

    if (pane) {
      // Crear un contenedor interno para los episodios
      const episodesGrid = document.createElement('div');
      episodesGrid.classList.add('row', 'g-3');
      pane.appendChild(episodesGrid);

      // Renderizar los episodios en el contenedor
      renderGridFilms(seasonEpisodes, episodesGrid, true);
    }
  });
}