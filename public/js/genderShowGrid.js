import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';

const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');
const pathParts = window.location.pathname.split('/');
const genderId = pathParts[pathParts.length - 1];

dropDownTypeMenu(categoriesDropDown, 'categories');
dropDownTypeMenu(gendersDropDown, 'genders');

try {
    const response = await fetch(`gender/${genderId}`);
    const data = await response.json();
    document.title = data.gender.name;
    console.log(data);
    const node = document.querySelector('.main-grid');

    data.gender.movies.forEach((movie) => {
        const article = document.createElement('article');
        article.classList.add('content');

        const link = document.createElement('a');
        link.href = `/content/${movie.slug}`;

        const img = document.createElement('img');
        img.src = backendURL + movie.cover;

        link.append(img);
        article.append(link);
        node.append(article);
    });


} catch(error) {
    console.log(error);
}