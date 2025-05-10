export function skippableAd(player, currentAd, midrollState) {
  if (currentAd && currentAd.skippable == 1) {
    // Crear botón de "Saltar anuncio"
    var skipButton = document.createElement('button');
    skipButton.id = 'skipAdsButton';
    skipButton.innerText = 'Saltar en ' + currentAd.skip_time;
    skipButton.style.position = 'absolute';
    skipButton.style.bottom = '40px';
    skipButton.style.right = '20px';
    skipButton.style.padding = '10px';
    skipButton.style.background = 'rgba(0, 0, 0, 0.7)';
    skipButton.style.color = 'white';
    skipButton.style.border = 'none';
    skipButton.style.cursor = 'pointer';
    skipButton.style.display = 'block';
    skipButton.disabled = true;

    player.el().appendChild(skipButton);

    // Iniciar cuenta atrás del skipButton
    var countdown = currentAd.skip_time;
    var countdownInterval;

    // Función para iniciar o reiniciar la cuenta atrás
    function startCountdown() {
      countdownInterval = setInterval(function () {
        if (!player.paused()) {
          countdown--;
          skipButton.innerText = 'Saltar en ' + countdown;
          if (countdown === 0) {
            clearInterval(countdownInterval);
            skipButton.innerText = 'Saltar anuncio';
            skipButton.disabled = false;
          }
        }
      }, 1000);
    }

    startCountdown();

    // Saltar anuncio
    skipButton.addEventListener('click', function () {
      console.log('Anuncio saltado');
      skipButton.remove();
      clearInterval(countdownInterval);
      player.ads.endLinearAdMode();
      
      if (midrollState) {
        midrollState.isPlayingMidroll = false;

        // Reproducir el siguiente midroll si hay pendientes
        setTimeout(function () {
          if (midrollState.pendingMidrolls.length > 0) {
            midrollState.playNextMidroll();
          }
        }, 500);
      }
    });

    // Eliminar el botón cuando termine el anuncio
    player.on('adend', function () {
      skipButton.remove();
      clearInterval(countdownInterval);
    });

    // Detener el contador cuando el anuncio está pausado
    player.on('pause', function () {
      clearInterval(countdownInterval);
    });

    // Reiniciar la cuenta atrás si el anuncio se reanuda
    player.on('play', function () {
      if (!skipButton.disabled) {
        startCountdown();
      }
    });
  }
}