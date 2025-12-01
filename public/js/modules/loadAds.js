export async function loadAds(id, token, isSerie) {
    try {
      const response = await fetch(`/api/ads/${id}/${isSerie} `, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const movie = data.movie;
      if (Array.isArray(data.ads.ads)) {
        return {
          movie: movie,
          ads: data.ads.ads.map((ad) => ({
            type: ad.type,
            ad_movie_type: ad.pivot?.type || 'unknown', // Usa 'unknown' si 'pivot' o 'type' no están definidos
            src: ad.url,
            time: ad.pivot?.midroll_time || 0, // Valor por defecto 0 si 'pivot' o 'midroll_time' no están definidos
            skippable: ad.pivot.skippable,
            skip_time: ad.pivot?.skip_time || 0,
          })),
        };
      } else {
        console.error('No se encontraron anuncios');
        return {
          movie: movie,
          ads: [],
        };
      }
    } catch (error) {
      console.error('Error al cargar los anuncios:', error);
      return {
        movie: null,
        ads: [],
      };
    }
}
