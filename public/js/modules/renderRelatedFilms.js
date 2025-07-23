import { formatDuration } from "./formatDuration.js";

export async function renderGridFilms(data, node) {
    data.forEach((movie) => {
        const article = document.createElement("article");
        article.classList.add("content", 'col-6', 'col-sm-4', 'col-md-3', 'col-lg-2');

        const link = document.createElement("a");
        link.href = `/content/${movie.slug}`;
        link.classList.add('text-decoration-none');

        const img = document.createElement("img");
        img.src = movie.cover;
        img.classList.add('img-fluid', 'rounded-2', 'mb-2');
        link.append(img);

        const info = document.createElement("a");
        info.classList.add('text-white');
        info.href = `/content/${movie.slug}`;
        info.classList.add("info");

        const title = document.createElement("h3");
        title.classList.add('h6', 'mb-1');
        title.textContent = movie.title;

        const gender = document.createElement("p");
        gender.textContent = `${movie.gender.name}`;
        gender.classList.add('text-white', 'small', 'mb-1');

        const duration = document.createElement("p");
        const formatedDuration = formatDuration(movie.duration);
        duration.textContent = `${formatedDuration}`;
        duration.classList.add('text-white', 'small');

        info.append(title, gender, duration);
        article.append(link, info);
        node.append(article);
    });

}