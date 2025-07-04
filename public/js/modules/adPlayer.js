import { setupPlayer } from './playerSetup.js';
import { setupPreroll } from './preroll.js';
import { setupMidroll } from './midroll.js';
import { setupPostroll } from './postroll.js';

export async function initAdPlayer(player, movieUrl, movieType, ads, movieId, token) {
  const playerInstance = await setupPlayer(player, movieUrl, movieType, movieId, token);

  // Configurar los manejadores de anuncios
  setupPreroll(playerInstance, movieUrl, movieType, ads, movieId, token);
  const midrollState = setupMidroll(playerInstance, movieUrl, movieType, ads, movieId, token);
  setupPostroll(playerInstance, movieUrl, movieType, ads, movieId, token);

  // Iniciar el reproductor
  playerInstance.trigger('adsready');

  return { playerInstance, midrollState };
}
