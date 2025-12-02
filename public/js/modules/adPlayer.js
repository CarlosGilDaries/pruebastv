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
      //console.log('initAdPlayer - initialTime:', initialTime);

      // Setup player SIN initialTime
      const playerInstance = await setupPlayer(
        player,
        movieUrl,
        movieType,
        movieId,
        token
      );

      // Variable para rastrear si ya aplicamos el initialTime
      let initialTimeApplied = false;
      let prerollHandled = false;

      // Función para aplicar el tiempo inicial
      const applyInitialTime = () => {
        if (!initialTimeApplied && initialTime > 0) {
          //console.log('Intentando aplicar tiempo inicial:', initialTime);

          // Intentar inmediatamente si ya hay metadatos
          if (playerInstance.duration() && !isNaN(playerInstance.duration())) {
            const duration = playerInstance.duration();
            if (initialTime < duration - 5) {
              //console.log('Aplicando tiempo inicial inmediatamente:',initialTime);
              playerInstance.currentTime(initialTime);
              initialTimeApplied = true;
            }
          } else {
            // Esperar a que los metadatos se carguen
            const loadedHandler = function () {
              const duration = playerInstance.duration();
              //console.log('Metadatos cargados, duración:', duration);

              if (initialTime < duration - 5) {
                //console.log('Aplicando tiempo inicial después de metadatos:',initialTime);
                playerInstance.currentTime(initialTime);
                initialTimeApplied = true;
              }
              playerInstance.off('loadedmetadata', loadedHandler);
            };

            playerInstance.on('loadedmetadata', loadedHandler);

            // Timeout de seguridad
            setTimeout(() => {
              if (!initialTimeApplied) {
                //console.log('Timeout en loadedmetadata, intentando aplicar tiempo');
                if (
                  playerInstance.duration() &&
                  initialTime < playerInstance.duration() - 5
                ) {
                  playerInstance.currentTime(initialTime);
                  initialTimeApplied = true;
                }
              }
            }, 3000);
          }
        }
      };

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

      // Evento cuando NO hay preroll (se aplica tiempo inicial inmediatamente)
      playerInstance.on('nopreroll', () => {
        //console.log('Evento nopreroll disparado');
        prerollHandled = true;

        // Aplicar tiempo inicial
        setTimeout(() => {
          applyInitialTime();
        }, 100); // Pequeño delay para asegurar que el contenido principal está cargándose

        resolve({ playerInstance, midrollState });
      });

      // Evento cuando TERMINA el preroll
      playerInstance.one('adended', function handler() {
        //console.log('Evento adended disparado (preroll)');
        prerollHandled = true;

        // Pequeño delay antes de aplicar tiempo inicial
        setTimeout(() => {
          applyInitialTime();
        }, 100);

        resolve({ playerInstance, midrollState });
      });

      // Iniciar flujo de ads
      //console.log('Disparando adsready...');
      playerInstance.trigger('adsready');

      // Caso de seguridad: si no se dispara ningún evento después de un tiempo
      setTimeout(() => {
        if (!prerollHandled) {
          //console.log('Timeout de seguridad - ningún evento de preroll fue disparado');
          applyInitialTime();
          resolve({ playerInstance, midrollState });
        }
      }, 3000);
    } catch (err) {
      console.error('Error en initAdPlayer:', err);
      reject(err);
    }
  });
}
