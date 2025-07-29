
import { setupLoginSignupButtons } from '../modules/loginSignupButtons.js';
import { formatDuration } from '../modules/formatDuration.js';

export async function gridShow(
  title = null,
  endpoint,
  id = null,
  token = null
) {
  try {
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
    if (title != null) {
      title.innerHTML = data[endpoint].name;
      title.setAttribute('data-i18n', `${endpoint}_${data[endpoint].id}`);
      document.title = data[endpoint].name;
    }
    const node = document.querySelector('.main-grid');

    const movies = id != null ? data[endpoint].movies : data[endpoint];

    movies.forEach((movie) => {
      const article = document.createElement('article');
      article.classList.add('content');

      const link = document.createElement('a');
      link.href = `/content/${movie.slug}`;

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
      gender.setAttribute('data-i18n', `gender_${movie.gender.id}`);
      gender.textContent = `${movie.gender.name}`;

      const duration = document.createElement('p');
      const formatedDuration = formatDuration(movie.duration);
      duration.textContent = `${formatedDuration}`;

      info.append(title2, gender, duration);
      article.append(link, info);
      node.append(article);

      if (movie.pay_per_view == 1) {
        const ppv = document.createElement('p');
        ppv.textContent = `Pay Per View: ${movie.pay_per_view_price} €`;
        info.append(ppv);
      }
    });

    setupLoginSignupButtons();
  } catch (error) {
    console.log(error);
  }
}