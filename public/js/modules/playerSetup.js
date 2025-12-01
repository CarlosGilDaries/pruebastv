import { getVideoSource } from './getVideoSource.js';

export async function setupPlayer(player, movieUrl, movieType, movieId, token) {
  const { type, url } = await getVideoSource(
    movieType,
    movieUrl,
    movieId,
    token
  );

  console.log('setupPlayer - Configurando fuente:', { type, url });

  // Configurar el source
  player.src({
    src: url,
    type: type,
  });

  // Inicializar ads
  player.ads();

  // IMPORTANTE: Forzar la carga de metadatos
  player.load();

  // Manejar reinicio después de contentended
  player.on('contentended', function () {
    player.one('play', function () {
      player.currentTime(0);
      player.play();
    });
  });

  console.log('setupPlayer completado');
  return player;
}
