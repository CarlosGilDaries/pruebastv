import { getVideoSource } from './getVideoSource.js';

export async function setupPlayer(
  player,
  movieUrl,
  movieType,
  movieId,
  token,
  initialTime = 0
) {
  const { type, url } = await getVideoSource(
    movieType,
    movieUrl,
    movieId,
    token
  );

  player.src({
    src: url,
    type: type,
  });

  // Inicializar ads
  player.ads();

  // Si hay tiempo inicial, configurarlo después de que los metadatos estén cargados
  if (initialTime > 0) {
    player.one('loadedmetadata', function () {
      // Saltar al tiempo guardado, pero no demasiado cerca del final
      const duration = player.duration();
      const startTime = initialTime < duration - 5 ? initialTime : 0;
      player.currentTime(startTime);
    });
  }

  // Manejar reinicio después de contentended
  player.on('contentended', function () {
    player.one('play', function () {
      player.currentTime(0);
      player.play();
    });
  });

  return player;
}
