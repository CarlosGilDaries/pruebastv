import { formatDuration } from './formatDuration.js';
import { applyTranslations } from '../translations.js';

export async function renderGridFilms(data, node, serie = false) {
  let counter = 0;
  let max;
  if (!serie) {
    max = 12;
  } else {
    max = data.length;
  }

  data.forEach((movie) => {
    counter++; 
    if (counter <= max) {
      const article = document.createElement('article');
      article.classList.add(
        'content',
        'col-12',
        'col-sm-6',
        'col-md-4',
        'col-lg-3',
        'col-xl-2'
      );

      const link = document.createElement('a');
      if (movie.seo_setting && movie.seo_setting.url) {
        link.href = movie.seo_setting.url;
      } else {
        link.href = `/contenido/${movie.slug}`;
      }
      link.classList.add('text-decoration-none');

      let imgSource;
      if (movie.cover) {
        imgSource = movie.cover;
      } else {
        imgSource = movie.image_url;
      }
      const img = document.createElement('img');
      img.src = imgSource;
      img.classList.add('img-fluid', 'rounded-2', 'mb-2');
      link.append(img);

      const info = document.createElement('a');
      info.classList.add(
        'info',
        'text-white',
        'd-flex',
        'flex-column',
        'justify-content-start',
        'gap-1',
        'm-0',
        'p-2'
      );

      if (movie.seo_setting && movie.seo_setting.url) {
        info.href = movie.seo_setting.url;
      } else {
        info.href = `/contenido/${movie.slug}`;
      }
      info.classList.add('info');

      let translation;
      if (movie.serie == 0) {
        translation = `content_${movie.id}_title`;
      } else {
         translation = `episode_${movie.id}_title`;
      }
      const title = document.createElement('h3');
      title.classList.add('h6', 'mb-0', 'text-break');
      title.setAttribute('data-i18n', translation);
      title.textContent = movie.title;

      const gender = document.createElement('p');
        gender.classList.add('text-white', 'small', 'mb-0', 'text-break');
        
      gender.innerHTML = '';
      if (movie.genders) {
        // Recorre todos los géneros
        movie.genders.forEach((g, index) => {
          const span = document.createElement('span');
          span.textContent = g.name;
          span.setAttribute('data-i18n', `gender_${g.id}`);
          gender.appendChild(span);

          // Insertar separador " - " excepto en el último
          if (index < movie.genders.length - 1) {
            gender.appendChild(document.createTextNode(' - '));
          }
        });
      }

      const duration = document.createElement('p');
      const formatedDuration = formatDuration(movie);
      duration.innerHTML = `${formatedDuration}`;
      duration.classList.add('text-white', 'small', 'mb-0', 'text-break');

      info.append(title, gender, duration);
      article.append(link, info);
      node.append(article);
    }
  });

  const currentLanguage = localStorage.getItem('userLocale') || 'es';
  if (typeof applyTranslations === 'function') {
    applyTranslations(currentLanguage);
  }
}
