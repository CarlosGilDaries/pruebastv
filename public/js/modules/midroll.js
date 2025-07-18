import { skippableAd } from './skippableAd.js';
import { getVideoSource } from './getVideoSource.js';

export function setupMidroll(player, movieUrl, movieType, ads, movieId, token, initialTime = 0) {
  const { type, url } = getVideoSource(movieType, movieUrl, movieId, token);
  const state = {
    playedMidrolls: new Set(), // Almacena los midrolls ya reproducidos
    pendingMidrolls: [], // Almacena los midrolls que aún deben reproducirse
    isPlayingMidroll: false, // Indica si se está reproduciendo un midroll
    savedTime: 0, // Variable para guardar el tiempo antes del midroll
    player: player,
    movieUrl: url,
    movieType: type,
    initialTime: initialTime,
  };

  // Filtrar los midrolls que deben mostrarse según el tiempo inicial
  const relevantMidrolls = ads
    .filter((ad) => ad.ad_movie_type === 'midroll')
    .filter((midroll) => midroll.time >= initialTime);

  player.on('timeupdate', function () {
    if (state.isPlayingMidroll) return; // No hacer nada si ya estamos en un midroll

    const currentTime = player.currentTime();

    // Solo considerar midrolls que no se han reproducido aún
    const newMidrolls = relevantMidrolls.filter(
      (midroll) =>
        !state.playedMidrolls.has(midroll.time) &&
        currentTime >= midroll.time &&
        !state.pendingMidrolls.some((p) => p.time === midroll.time)
    );

    // Agregar los nuevos midrolls pendientes y ordenarlos por tiempo
    state.pendingMidrolls.push(...newMidrolls);
    state.pendingMidrolls.sort((a, b) => a.time - b.time);

    // Si hay midrolls pendientes y no se está reproduciendo un anuncio, reproducir el primero
    if (state.pendingMidrolls.length > 0 && !player.ads.isAdPlaying()) {
      state.playNextMidroll();
    }
  });

  state.playNextMidroll = function () {
    if (state.pendingMidrolls.length === 0) {
      state.isPlayingMidroll = false;
      return; // Si no hay más midrolls, salir
    }

    // Evitar iniciar un anuncio si ya está en modo de anuncio
    if (state.player.ads.isInAdMode()) return;

    state.isPlayingMidroll = true; // Indicar que un midroll está en reproducción
    const midroll = state.pendingMidrolls.shift(); // Obtener el siguiente midroll en la lista
    state.playedMidrolls.add(midroll.time); // Marcarlo como reproducido
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
      state.isPlayingMidroll = false; // Permitir nuevos midrolls

      state.player.one('loadedmetadata', function () {
        state.player.currentTime(state.savedTime);
        state.player.play();

        // Si quedan más midrolls, reproducir el siguiente
        if (state.pendingMidrolls.length > 0) {
          setTimeout(state.playNextMidroll, 500); // Pequeña pausa para evitar problemas de carga
        }
      });
    });

    skippableAd(state.player, midroll, state);
  };

  return state;
}
