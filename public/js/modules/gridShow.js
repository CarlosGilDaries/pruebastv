
import { setupLoginSignupButtons } from '../modules/loginSignupButtons.js';
import { formatDuration } from '../modules/formatDuration.js';

export async function gridShow(title, endpoint, id) {
    try {
        const response = await fetch(`/api/${endpoint}/${id}`);
        const data = await response.json();
        console.log(endpoint);
        console.log(data);
        title.innerHTML = data[endpoint].name;
        document.title = data[endpoint].name;
        const node = document.querySelector('.main-grid');

        data[endpoint].movies.forEach((movie) => {
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

          const title = document.createElement('h3');
          title.textContent = movie.title;

          const gender = document.createElement('p');
          gender.textContent = `${movie.gender.name}`;

          const duration = document.createElement('p');
          const formatedDuration = formatDuration(movie.duration);
          duration.textContent = `${formatedDuration}`;

          info.append(title, gender, duration);
          article.append(link, info);
          node.append(article);

          if (movie.pay_per_view == 1) {
            const ppv = document.createElement('p');
            ppv.textContent = `Contenido Pay Per View: ${movie.pay_per_view_price} €`;
            info.append(ppv);
          }
        });

        setupLoginSignupButtons();

    } catch (error) {
        console.log(error);
    }
}