document.addEventListener('DOMContentLoaded', function () {
  const searchToggle = document.getElementById('searchToggle');
  const searchBox = document.getElementById('searchBox');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  let debounceTimer;

  // Mostrar/ocultar el input de búsqueda
  searchToggle.addEventListener('click', function (e) {
    e.preventDefault();
    searchBox.classList.toggle('active');
    if (searchBox.classList.contains('active')) {
      searchInput.focus();
    }
  });

  // Buscar mientras se escribe con debounce
  searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    const query = this.value.trim();

    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(() => {
      searchContent(query);
    }, 300);
  });

  // Cerrar el buscador al hacer clic fuera
  document.addEventListener('click', function (e) {
    if (!searchBox.contains(e.target) && e.target !== searchToggle) {
      searchBox.classList.remove('active');
    }
  });

  // Función para buscar contenido
  function searchContent(query) {
    fetch(`/api/content?search=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.data.movies) {
          displayResults(data.data.movies, query);
        } else {
          searchResults.innerHTML = '<li>No se encontraron resultados</li>';
        }
      })
      .catch((error) => {
        console.error('Error en la búsqueda:', error);
        searchResults.innerHTML = '<li>Error al buscar</li>';
      });
  }

  // Mostrar resultados de búsqueda
  function displayResults(movies, query) {
    if (movies.length === 0) {
      searchResults.innerHTML = '<li>No se encontraron resultados</li>';
      return;
    }

    // Filtrar y ordenar resultados por relevancia
    const results = movies
      .map((movie) => {
        const titleMatch = movie.title
          .toLowerCase()
          .includes(query.toLowerCase());
        const taglineMatch =
          movie.tagline &&
          movie.tagline.toLowerCase().includes(query.toLowerCase());
        const overviewMatch = movie.overview
          .toLowerCase()
          .includes(query.toLowerCase());

        // Puntuación de relevancia
        let score = 0;
        if (titleMatch) score += 3;
        if (taglineMatch) score += 2;
        if (overviewMatch) score += 1;

        return { ...movie, score };
      })
      .filter((movie) => movie.score > 0)
      .sort((a, b) => b.score - a.score);

    if (results.length === 0) {
      searchResults.innerHTML = '<li>No se encontraron resultados</li>';
      return;
    }

    // Mostrar resultados
    searchResults.innerHTML = results
      .map(
        (movie) => `
                        <li data-slug="${movie.slug}">
                            <a href="/content/${movie.slug}">${movie.title}</a>
                        </li>
                    `
      )
      .join('');
  }

  // Delegación de eventos para los resultados
  searchResults.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      searchBox.classList.remove('active');
      searchInput.value = '';
      searchResults.innerHTML = '';
    }
  });
});
