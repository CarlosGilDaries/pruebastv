export function setupBackArrowAndTitle(player, content) {
    const videoJsElement = player.el();
    const backButtonContainer = document.createElement('div');
    backButtonContainer.className = 'vjs-back-button-container';
    const backButton = document.createElement('img');
    backButton.src = '/images/left.png';
    backButton.className = 'vjs-back-button';
    backButton.addEventListener('click', () => {
      window.location.href = `/content/${content.slug}`;
    });

    const videoTitle = document.createElement('div');
    videoTitle.className = 'vjs-video-title';
    videoTitle.textContent = content.title;

    backButtonContainer.appendChild(backButton);
    backButtonContainer.appendChild(videoTitle);
    player.el().appendChild(backButtonContainer);

    let inactivityTimer;

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

    player.el().addEventListener('mousemove', () => {
      showBackButton();
      handleOverlays(true);
    });

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