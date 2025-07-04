export async function renderTypeGrid(route, types, type) {
  try {
    const response = await fetch(route);
    const data = await response.json();
    const items = data[types];
    const main = document.querySelector('.main-grid');

    items.forEach((item) => {
      const typeBox = document.createElement('div');
      if (item.movies?.length > 0 && item.movies[0].cover) {
        typeBox.style.backgroundImage = `url('${item.movies[0].cover}')`;
      }
      typeBox.style.backgroundSize = 'cover';
      typeBox.style.backgroundPosition = 'center';
      typeBox.style.backgroundRepeat = 'no-repeat';
      typeBox.setAttribute('data-id', item.id);
      typeBox.classList.add(`${type}-box`, 'box');
      typeBox.innerHTML = `
  <div class="overlay-text">
    <h2 class="${type}-name">${item.name}</h2>
  </div>
`;
      typeBox.addEventListener('click', () => {
        window.location.href = `/${type}-show.html?id=${item.id}`;
      });

      main.appendChild(typeBox);
    });
  } catch (error) {
    console.error(error);
  }
}
