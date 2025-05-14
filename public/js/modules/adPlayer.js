import { setupPlayer } from './playerSetup.js';
import { setupPreroll } from './preroll.js';
import { setupMidroll } from './midroll.js';
import { setupPostroll } from './postroll.js';

export async function initAdPlayer(player, movieUrl, backendUrl, movieType, ads, movieId, token) {
  const playerInstance = await setupPlayer(player, movieUrl, backendUrl, movieType, movieId, token);

  // Configurar los manejadores de anuncios
  setupPreroll(playerInstance, movieUrl, backendUrl, movieType, ads, movieId, token);
  const midrollState = setupMidroll(playerInstance, movieUrl, backendUrl, movieType, ads, movieId, token);
  setupPostroll(playerInstance, movieUrl, backendUrl, movieType, ads, movieId, token);

  // Iniciar el reproductor
  playerInstance.trigger('adsready');

  return { playerInstance, midrollState };
}
