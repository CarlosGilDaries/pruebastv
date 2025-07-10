import { getVideoContent } from './getVideoContent.js';
import { renderActionCall } from './renderActionCall.js';

export async function renderCategories(main, categoriesData) {
  let actions = [];
  try {
    const response = await fetch('/api/actions');
    if (response.ok) {
      const data = await response.json();
      actions = data.actions || [];
    }
  } catch (error) {
    console.error('Error loading actions:', error);
  }

  let nextActionIndex = 0;
  let categoryCounter = 0;

  const categories = categoriesData.categories
    .filter((category) => category.priority != 1)
    .sort((a, b) => a.priority - b.priority);

  for (const category of categories) {
    // Renderizar la categoría
    const content = category.movies;
    const section = document.createElement('section');
    section.setAttribute('data-index', category.priority);
    section.classList.add('category', 'content-type');
    section.innerHTML = `
            <h2 class="category-title" id="title-${category.priority}">${category.name}</h2>
            <div class="content-wrapper">
                <button class="scroll-left">&lt;</button>
                <div id="video-content-${category.priority}" class="content-container"></div>
                <button class="scroll-right">&gt;</button>
            </div>
        `;
    main.appendChild(section);
    const node = document.getElementById(`video-content-${category.priority}`);
    getVideoContent(content, node);

    categoryCounter++;

    // Insertar acción cada 3 categorías si quedan acciones disponibles
    if (categoryCounter % 2 === 0 && nextActionIndex < actions.length) {
      renderActionCall(main, actions[nextActionIndex]);
      nextActionIndex++;
    }
  }
}
