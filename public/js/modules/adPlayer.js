import { setupPlayer } from './playerSetup.js';
import { setupPreroll } from './preroll.js';
import { setupMidroll } from './midroll.js';
import { setupPostroll } from './postroll.js';

export async function initAdPlayer(player, movieUrl, backendUrl, movieType, ads) {
  const playerInstance = setupPlayer(player, movieUrl, backendUrl, movieType);

  // Configurar los manejadores de anuncios
  setupPreroll(playerInstance, movieUrl, backendUrl, movieType, ads);
  const midrollState = setupMidroll(playerInstance, movieUrl, backendUrl, movieType, ads);
  setupPostroll(playerInstance, movieUrl, backendUrl, movieType, ads);

  // Iniciar el reproductor
  playerInstance.trigger('adsready');

  return { playerInstance, midrollState };
}
