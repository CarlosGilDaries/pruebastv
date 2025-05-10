import { skippableAd } from './skippableAd.js';

export function setupPostroll(player, movieUrl, backendUrl, movieType, ads) {
  const postroll = ads.find((ad) => ad.ad_movie_type === 'postroll');

  if (!postroll) {
    player.trigger('nopostroll');
    return;
  }

  player.one('contentended', function () {
    player.on('readyforpostroll', function () {
      player.ads.startLinearAdMode();
      player.src({
        src: backendUrl + postroll.src,
        type: postroll.type,
      });

      player.one('adplaying', function () {
        player.trigger('ads-ad-started');
        skippableAd(player, postroll);
      });

      player.one('adended', function () {
        player.ads.endLinearAdMode();
        player.src({
          src: backendUrl + movieUrl,
          type: movieType,
        });
        player.trigger('ended');
      });
    });
  });
}
