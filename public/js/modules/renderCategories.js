import { getVideoContent } from "./getVideoContent.js";

export async function renderCategories(categoriesData, sectionArray, backendURL) {
    sectionArray.forEach(section => {
        const index = section.getAttribute('data-index');
        const category = categoriesData.categories[index - 1];
        const title = document.getElementById(`title-${index}`);
        title.innerHTML = category.name;
        const node = document.getElementById(`video-content-${index}`);
        const content = category.movies;

        getVideoContent(content, node, backendURL);
    });
}
