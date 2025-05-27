import { getVideoContent } from "./getVideoContent.js";
/*
La idea es coger todos los divs de categorías del index, y en función de su data-index 
cambiar dinámicamente el título por el nombre de la categoría y mandarle el #video-content,
el array de contenido y la url del backend a getVideoContent para que renderice el contenido
*/ 
export async function renderCategories(categoriesData, sectionArray, backendURL) {
    sectionArray.forEach(section => {
        const index = section.getAttribute('data-index');
        const category = categoriesData.categories[index];
        const title = document.getElementById(`title-${index}`);
        title.innerHTML = category.name;
        const node = document.getElementById(`video-content-${index}`);
        const content = category.movies;

        getVideoContent(content, node, backendURL);
    });
}