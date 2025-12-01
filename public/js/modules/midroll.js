import { skippableAd } from './skippableAd.js';
import { getVideoSource } from './getVideoSource.js';

export function setupMidroll(
  player,
  movieUrl,
  movieType,
  ads,
  movieId,
  token,
  initialTime = 0
) {
  const { type, url } = getVideoSource(movieType, movieUrl, movieId, token);
  const state = {
    playedMidrolls: new Set(),
    pendingMidrolls: [],
    isPlayingMidroll: false,
    savedTime: 0,
    player: player,
    movieUrl: url,
    movieType: type,
    initialTime: initialTime, // Guardar initialTime en el estado
  };

  // IMPORTANTE: Filtrar midrolls que estén DESPUÉS del initialTime
  const relevantMidrolls = ads
    .filter((ad) => ad.ad_movie_type === 'midroll')
    .filter((midroll) => midroll.time >= initialTime);

  player.on('timeupdate', function () {
    if (state.isPlayingMidroll) return;

    // NO considerar midrolls si estamos antes del tiempo inicial guardado
    const currentTime = player.currentTime();
    if (currentTime < initialTime) return;

    const newMidrolls = relevantMidrolls.filter(
      (midroll) =>
        !state.playedMidrolls.has(midroll.time) &&
        currentTime >= midroll.time &&
        !state.pendingMidrolls.some((p) => p.time === midroll.time)
    );

    state.pendingMidrolls.push(...newMidrolls);
    state.pendingMidrolls.sort((a, b) => a.time - b.time);

    if (state.pendingMidrolls.length > 0 && !player.ads.isAdPlaying()) {
      state.playNextMidroll();
    }
  });

  state.playNextMidroll = function () {
    if (state.pendingMidrolls.length === 0) {
      state.isPlayingMidroll = false;
      return;
    }

    if (state.player.ads.isInAdMode()) return;

    state.isPlayingMidroll = true;
    const midroll = state.pendingMidrolls.shift();
    state.playedMidrolls.add(midroll.time);
    state.savedTime = player.currentTime();

    state.player.ads.startLinearAdMode();
    state.player.src({
      src: midroll.src,
      type: midroll.type,
    });

    state.player.one('adplaying', function () {
      document.querySelector(
        '#my-video > div.vjs-back-button-container'
      ).style.display = 'none';
      state.player.trigger('ads-ad-started');
    });

    state.player.one('adended', function () {
      document.querySelector(
        '#my-video > div.vjs-back-button-container'
      ).style.display = 'flex';
      state.player.ads.endLinearAdMode();
      state.isPlayingMidroll = false;

      // Cuando vuelve al contenido principal
      state.player.one('loadedmetadata', function () {
        // Volver al tiempo guardado (no al initialTime)
        state.player.currentTime(state.savedTime);
        state.player.play();

        if (state.pendingMidrolls.length > 0) {
          setTimeout(state.playNextMidroll, 500);
        }
      });
    });

    skippableAd(state.player, midroll, state);
  };

  return state;
}

