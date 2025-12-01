import { setupPlayer } from './playerSetup.js';
import { setupPreroll } from './preroll.js';
import { setupMidroll } from './midroll.js';
import { setupPostroll } from './postroll.js';

export function initAdPlayer(
  player,
  movieUrl,
  movieType,
  ads,
  movieId,
  token,
  initialTime = 0
) {
  return new Promise(async (resolve, reject) => {
    try {
      const playerInstance = await setupPlayer(
        player,
        movieUrl,
        movieType,
        movieId,
        token
      );

      // Configurar anuncios
      setupPreroll(
        playerInstance,
        movieUrl,
        movieType,
        ads,
        movieId,
        token,
        initialTime
      );
      const midrollState = setupMidroll(
        playerInstance,
        movieUrl,
        movieType,
        ads,
        movieId,
        token,
        initialTime
      );
      setupPostroll(playerInstance, movieUrl, movieType, ads, movieId, token);

      // ⬅️ Resolver la promesa cuando ACABE EL PREROLL
      playerInstance.one('adended', () => {
        // Si el anuncio que terminó es preroll, resolvemos
        resolve({ playerInstance, midrollState });
      });

      // Manejo de caso sin preroll
      playerInstance.one('nopreroll', () => {
        resolve({ playerInstance, midrollState });
      });

      // Iniciar flujo de ads
      playerInstance.trigger('adsready');
    } catch (err) {
      reject(err);
    }
  });
}

