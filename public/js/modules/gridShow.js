
import { setupLoginSignupButtons } from '../modules/loginSignupButtons.js';
import { formatDuration } from '../modules/formatDuration.js';
import { hideSpinner } from './spinner.js';
import { showSpinner } from './spinner.js';
import { setSeoSettings } from './setSeoSettings.js';
import { setGoogleAnalyticsScript } from './setScripts.js';

export async function gridShow(
  title = null,
  endpoint,
  id = null,
  token = null
) {
  try {
    showSpinner();
    const url = id != null ? `/api/${endpoint}/${id}` : `/api/${endpoint}`;

    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, options);
    const data = await response.json();

    let seoSettings;
    let scripts;
    if (data[endpoint]) {
      seoSettings = data[endpoint].seo_setting;
      scripts = data[endpoint].scripts;
      if (seoSettings) {
        setSeoSettings(seoSettings);
      }
      const alreadyActivated = document.getElementById('ga-script-2');
      if (!alreadyActivated) {
        setGoogleAnalyticsScript(scripts, null);
      }
    }

    if (title != null) {
      title.innerHTML = data[endpoint].name;
      title.setAttribute('data-i18n', `${endpoint}_${data[endpoint].id}`);
    }
    const node = document.querySelector('.main-grid');

    let movies = id != null ? data[endpoint].movies : data[endpoint];
    if (movies == undefined) {
      movies = data.movies;
    }
    
    movies.forEach((movie) => {
      const article = document.createElement('article');
      article.classList.add('content');

      const link = document.createElement('a');
      if (movie.seo_setting && movie.seo_setting.url) {
        link.href = movie.seo_setting.url;
      } else {
        link.href = `/contenido/${movie.slug}`;
      }

      const img = document.createElement('img');
      img.src = movie.cover;
      link.append(img);

      const info = document.createElement('a');
      info.href = `/content/${movie.slug}`;
      info.classList.add('info');

      const title2 = document.createElement('h3');
      title2.setAttribute('data-i18n', `content_${movie.id}_title`);
      title2.textContent = movie.title;

      const gender = document.createElement('p');
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
        const formatedDuration = formatDuration(movie);
        duration.innerHTML = `${formatedDuration}`;

      info.append(title2, gender, duration);
      article.append(link, info);
      node.append(article);

      if (movie.pay_per_view == 1) {
        const ppv = document.createElement('p');
        ppv.textContent = `Pay Per View: ${movie.pay_per_view_price} €`;
        info.append(ppv);
      }

      if (movie.rent == 1) {
        const rent = document.createElement('p');
        rent.innerHTML = `<span data-i18n="rent">Alquiler</span>: ${movie.rent_price} €`;
        info.append(rent);
      }

      hideSpinner();
    });

    setupLoginSignupButtons();
  } catch (error) {
    console.log(error);
    hideSpinner();
    window.location.href = '/';
  } finally {
    hideSpinner();
  }
}