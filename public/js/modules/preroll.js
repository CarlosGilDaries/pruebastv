import { skippableAd } from './skippableAd.js';
import { getVideoSource } from './getVideoSource.js';

export function setupPreroll(
  player,
  movieUrl,
  movieType,
  ads,
  movieId,
  token,
  initialTime = 0
) {
  const preroll = ads.find((ad) => ad.ad_movie_type === 'preroll');

  // Solo mostrar preroll si el usuario comienza desde el inicio
  if (initialTime > 0) {
    //console.log('Tiempo guardado encontrado, saltando preroll. initialTime:',initialTime);

    // IMPORTANTE: Asegurar que se dispare el evento nopreroll
    // Pequeño delay para asegurar que los listeners están configurados
    setTimeout(() => {
      //console.log('Disparando nopreroll event');
      player.trigger('nopreroll');
    }, 50);

    return;
  }

  if (!preroll) {
    //console.log('No hay preroll disponible');
    setTimeout(() => {
      player.trigger('nopreroll');
    }, 50);
    return;
  }

  //console.log('Configurando preroll para tiempo 0');
  player.on('readyforpreroll', function () {
    //console.log('readyforpreroll disparado');
    player.ads.startLinearAdMode();
    player.src({
      src: preroll.src,
      type: preroll.type,
    });

    player.one('adplaying', function () {
      //console.log('Preroll empezando');
      document.querySelector(
        '#my-video > div.vjs-back-button-container'
      ).style.display = 'none';
      player.trigger('ads-ad-started');
      skippableAd(player, preroll);
    });

    player.one('adended', function () {
      //console.log('Preroll terminado');
      player.ads.endLinearAdMode();
      document.querySelector(
        '#my-video > div.vjs-back-button-container'
      ).style.display = 'flex';
    });
  });
}
