export function setupPlayer(player, movieUrl, backendUrl, movieType) {

  player.src({
    src: backendUrl + movieUrl,
    type: movieType,
  });

  // Inicializar ads
  player.ads();

  // Manejar reinicio después de contentended
  player.on('contentended', function () {
    player.one('play', function () {
      player.currentTime(0);
      player.play();
    });
  });

  return player;
}
