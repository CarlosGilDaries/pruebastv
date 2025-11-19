import { formatDuration } from './formatDuration.js';
import { applyTranslations } from '../translations.js';

export function initPriorityBanner(categoriesData) {
  try {
    // Encontrar la categoría con priority 1
    const priorityCategory = categoriesData.categories.find(
      (cat) => cat.priority === 1
    );
    if (
      !priorityCategory ||
      !priorityCategory.movies ||
      priorityCategory.movies.length === 0
    ) {
      console.warn('No se encontraron películas en la categoría prioritaria');
      return;
    }

    const bannerSection = document.querySelector(
      '.background-banner.priority-first'
    );
    const videoElement = bannerSection.querySelector('video');
    const sourceElement = videoElement.querySelector('source');
    const titleElement = bannerSection.querySelector(
      '.priority-first-movie-title'
    );
    const playButton = bannerSection.querySelector('.play-button');
    const movieInfo = bannerSection.querySelector('.movie-info');
    const gender = document.getElementById('banner-gender');
    const duration = document.getElementById('banner-duration');

    let currentMovieIndex = 0;
    const movies = priorityCategory.movies;
    let isTransitioning = false;

    // Función para aplicar traducciones al género
    function applyGenderTranslation(genderElement, genderData) {
      genderElement.setAttribute('data-i18n', `gender_${genderData.id}`);
      genderElement.textContent = genderData.name;
      applyTranslations(localStorage.getItem('userLocale') || 'es');
    }

    // Función para cargar una película con transición
    async function loadMovie(index) {
      if (isTransitioning) return;
      isTransitioning = true;

      const movie = movies[index];
      let location;
      if (movie.seo_setting && movie.seo_setting.url) {
        location = movie.seo_setting.url;
      } else {
        location = `/contenido/${movie.slug}`;
      }

      // Fade out del contenido actual
      movieInfo.classList.add('title-transition');
      titleElement.style.opacity = '0';
      videoElement.style.opacity = '0';
      gender.style.opacity = '0';
      duration.style.opacity = '0';

      // Esperar a que complete la transición de salida
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Actualizar contenido
      titleElement.textContent = movie.title;
      const gendersArray = movie.genders;
      gendersArray.forEach(genderElement => {
        applyGenderTranslation(gender, genderElement);
      });
      duration.textContent = formatDuration(movie.duration);
      playButton.onclick = () =>
        (window.location.href = location);

      if (movie.trailer) {
        // Detener video anterior
        videoElement.pause();
        videoElement.removeAttribute('poster');
        sourceElement.removeAttribute('src');
        videoElement.load();

        // Asignar nuevo póster
        videoElement.poster = movie.cover;

        // Cargar nuevo trailer
        setTimeout(() => {
          sourceElement.src = movie.trailer;
          videoElement.load();
          const playPromise = videoElement.play();

          if (playPromise !== undefined) {
            playPromise
              .catch((e) => {
                console.log('Autoplay bloqueado:', e);
                videoElement.poster = movie.cover;
                videoElement.pause();
              })
              .finally(() => {
                videoElement.style.display = 'block';
              });
          }
        }, 1500);
      } else {
        videoElement.poster = movie.cover;
        videoElement.pause();
        sourceElement.removeAttribute('src');
        videoElement.load();
      }

      // Fade in del nuevo contenido
      await new Promise((resolve) => setTimeout(resolve, 50));
      titleElement.style.opacity = '1';
      videoElement.style.opacity = '1';
      gender.style.opacity = '1';
      duration.style.opacity = '1';

      // Resetear estado de transición
      setTimeout(() => {
        movieInfo.classList.remove('title-transition');
        isTransitioning = false;
      }, 500);
    }

    // Configurar flechas de navegación
    const leftArrow = document.createElement('button');
    leftArrow.className = 'scroll-left-banner';
    leftArrow.innerHTML = '&lt;';

    const rightArrow = document.createElement('button');
    rightArrow.className = 'scroll-right-banner';
    rightArrow.innerHTML = '&gt;';

    bannerSection.appendChild(leftArrow);
    bannerSection.appendChild(rightArrow);

    leftArrow.addEventListener('click', () => {
      currentMovieIndex =
        (currentMovieIndex - 1 + movies.length) % movies.length;
      loadMovie(currentMovieIndex);
    });

    rightArrow.addEventListener('click', () => {
      currentMovieIndex = (currentMovieIndex + 1) % movies.length;
      loadMovie(currentMovieIndex);
    });

    // Estilos iniciales para la transición
    videoElement.style.transition = 'opacity 0.5s ease-in-out';
    titleElement.style.transition = 'opacity 0.2s ease-in-out';
    gender.style.transition = 'opacity 0.2s ease-in-out';
    duration.style.transition = 'opacity 0.2s ease-in-out';

    // Cargar la primera película
    loadMovie(0);
  } catch (error) {
    console.log(error);
  }
}
