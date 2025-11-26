import { renderGridFilms } from './renderRelatedFilms.js';

export async function renderSimilars(content, token) {
  // Si la película no tiene géneros, no hacemos nada
  if (!content.genders || content.genders.length === 0) {
    console.warn('Este contenido no tiene géneros asociados.');
    return;
  }

  const similarsContainer = document.getElementById('similars');
  let allMovies = [];

  // 1. Recorrer todos los géneros del contenido
  for (const gender of content.genders) {
    const response = await fetch(`/api/gender/${gender.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    // 2. Añadir películas de este género
    if (data.gender && data.gender.movies) {
      allMovies = allMovies.concat(data.gender.movies);
    }
  }

  // 3. Eliminar duplicados por ID
  const uniqueMovies = Array.from(
    new Map(allMovies.map((m) => [m.id, m])).values()
  );

  // 4. Excluir la película actual
  const filteredContents = uniqueMovies.filter(
    (movie) => movie.id !== content.id
  );

  // 5. Renderizar
  renderGridFilms(filteredContents, similarsContainer);
}
