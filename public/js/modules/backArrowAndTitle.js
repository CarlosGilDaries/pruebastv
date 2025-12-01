export function setupBackArrowAndTitle(player, content, isSerie) {
  const videoJsElement = player.el();
  const backButtonContainer = document.createElement('div');
  backButtonContainer.className = 'vjs-back-button-container';
  const backButton = document.createElement('img');
  backButton.src = '/images/left.png';
  backButton.className = 'vjs-back-button';
  
  let location;
  console.log(content);
  if (!isSerie) {
    if (content.seo_setting && content.seo_setting.url) {
      location = content.seo_setting.url;
    } else {
      location = `/contenido/${content.slug}`;
    }
  } else {
    location = content.seo_setting.canonical;
  }
  
  backButton.addEventListener('click', () => {
    window.location.href = location;
  });

  const videoTitle = document.createElement('div');
  videoTitle.className = 'vjs-video-title';
  videoTitle.textContent = content.title;

  backButtonContainer.appendChild(backButton);
  backButtonContainer.appendChild(videoTitle);
  player.el().appendChild(backButtonContainer);

  let inactivityTimer;
  let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function handleOverlays(show) {
    if (show) {
      videoJsElement.classList.add('show-overlays');
      resetInactivityTimer();
    } else if (!player.paused()) {
      videoJsElement.classList.remove('show-overlays');
    }
  }

  function showBackButton() {
    backButtonContainer.classList.add('visible');
    resetInactivityTimer();
  }

  function hideBackButton() {
    if (!player.paused()) {
      backButtonContainer.classList.remove('visible');
    }
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (!player.paused()) {
      inactivityTimer = setTimeout(() => {
        hideBackButton();
        videoJsElement.classList.remove('show-overlays');
      }, 3000);
    }
  }

  // Función para manejar la interacción del usuario
  function handleUserInteraction() {
    showBackButton();
    handleOverlays(true);
  }

  // Eventos para dispositivos con ratón
  player.el().addEventListener('mousemove', handleUserInteraction);

  // Eventos para dispositivos táctiles
  if (isTouchDevice) {
    player.el().addEventListener('touchstart', handleUserInteraction);
    player.el().addEventListener('touchmove', handleUserInteraction);

    // Evitar que el touch desplace la página
    player.el().addEventListener(
      'touchmove',
      (e) => {
        if (player.paused()) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  player.on('play', () => {
    resetInactivityTimer();
  });

  player.on('pause', () => {
    clearTimeout(inactivityTimer);
    showBackButton();
    handleOverlays(true);
  });

  if (player.paused()) {
    showBackButton();
    handleOverlays(true);
  }
}
