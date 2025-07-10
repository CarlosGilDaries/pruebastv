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
  // Solo mostrar preroll si el usuario comienza desde el inicio
  if (initialTime > 0) {
    player.trigger('nopreroll');
    return;
  }

  const preroll = ads.find((ad) => ad.ad_movie_type === 'preroll');
  const { type, url } = getVideoSource(movieType, movieUrl, movieId, token);

  if (!preroll) {
    player.trigger('nopreroll');
    return;
  }

  player.on('readyforpreroll', function () {
    player.ads.startLinearAdMode();
    player.src({
      src: preroll.src,
      type: preroll.type,
    });

    // Cuando el anuncio empiece, quitar el loader
    player.one('adplaying', function () {
      document.querySelector(
        '#my-video > div.vjs-back-button-container'
      ).style.display = 'none';
      player.trigger('ads-ad-started');
      skippableAd(player, preroll);
    });

    player.one('adended', function () {
      player.ads.endLinearAdMode();
      document.querySelector(
        '#my-video > div.vjs-back-button-container'
      ).style.display = 'flex';
    });
  });
}
