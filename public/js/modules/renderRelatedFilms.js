import { formatDuration } from './formatDuration.js';
import { applyTranslations } from '../translations.js';

export async function renderGridFilms(data, node) {
  let counter = 0;
  data.forEach((movie) => {
    counter++;
    if (counter <= 12) {
      const article = document.createElement('article');
      article.classList.add(
        'content',
        'col-6',
        'col-sm-4',
        'col-md-3',
        'col-lg-2'
      );

      const link = document.createElement('a');
      if (movie.seo_setting && movie.seo_setting.url) {
        link.href = movie.seo_setting.url;
      } else {
        link.href = `/contenido/${movie.slug}`;
      }
      link.classList.add('text-decoration-none');

      const img = document.createElement('img');
      img.src = movie.cover;
      img.classList.add('img-fluid', 'rounded-2', 'mb-2');
      link.append(img);

      const info = document.createElement('a');
      info.classList.add('text-white');
      if (movie.seo_setting && movie.seo_setting.url) {
        info.href = movie.seo_setting.url;
      } else {
        info.href = `/contenido/${movie.slug}`;
      }
      info.classList.add('info');

      const title = document.createElement('h3');
      title.classList.add('h6', 'mb-1');
      title.setAttribute('data-i18n', `content_${movie.id}_title`);
      title.textContent = movie.title;

      const gender = document.createElement('p');
        gender.classList.add('text-white', 'small', 'mb-1');
        
        gender.innerHTML = '';
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

      const duration = document.createElement('p');
      const formatedDuration = formatDuration(movie.duration);
      duration.textContent = `${formatedDuration}`;
      duration.classList.add('text-white', 'small');

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
