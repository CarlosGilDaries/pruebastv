import { addScrollFunctionality } from './addScrollFunctionality.js';
import { formatDuration } from './formatDuration.js';

export function getKeepWatchingContent(data, node) {
  data.forEach((video) => {
    console.log(video);
    const article = document.createElement('article');
    article.classList.add('content');

    const link = document.createElement('a');
    const info = document.createElement('a');
    info.classList.add('miniature-info');
    if (video.episode_number) {
        link.href = `/player/episode/${video.id}`;
        info.href = `/player/episode/${video.id}`;
    } else {
        link.href = `/player/content/${video.id}`;
        info.href = `/player/content/${video.id}`;
    }


    const img = document.createElement('img');
    if (video.tall_cover) {
      img.src = video.tall_cover;
    } else {
      img.src = video.movie.tall_cover;
    }
    link.append(img);

    const title = document.createElement('h3');
    if (video.movie) {
      title.setAttribute('data-i18n', `content_${video.movie.id}_title`);
      title.textContent = video.movie.title;
    } else {
      title.setAttribute('data-i18n', `content_${video.id}_title`);
      title.textContent = video.title;
    }

    const gender = document.createElement('p');
    // Recorre todos los géneros
    if (video.genders) {
      gender.innerHTML = '';
      let genders;
      genders = video.genders;
      genders.forEach((g, index) => {
        const span = document.createElement('span');
        span.textContent = g.name;
        span.setAttribute('data-i18n', `gender_${g.id}`);
        gender.appendChild(span);

        // Insertar separador " - " excepto en el último
        if (index < genders.length - 1) {
          gender.appendChild(document.createTextNode(' - '));
        }
      });
    } else {
      gender.setAttribute('data-i18n', `episode_${video.id}_title`);
      gender.innerHTML = video.title;
    }

    const duration = document.createElement('p');
    const formatedDuration = formatDuration(video);
    duration.innerHTML = `${formatedDuration}`;

    info.append(title, gender, duration);

    if (video.pay_per_view == 1) {
      const ppv = document.createElement('p');
      ppv.textContent = `Pay Per View: ${video.pay_per_view_price} €`;
      info.append(ppv);
    }

    if (video.rent == 1) {
      const rent = document.createElement('p');
      rent.innerHTML = `<span data-i18n="rent">Alquiler</span>: ${video.rent_price} €`;
      info.append(rent);
    }

    article.append(link, info);
    node.append(article);
  });

  const exampleImg = node.querySelector('img');
  const scrollWidth = parseFloat(getComputedStyle(exampleImg).width) * 1.06;
  addScrollFunctionality(node, scrollWidth);
}
