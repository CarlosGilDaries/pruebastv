export class VideoProgressTracker {
  constructor(movieId, player, token, isSerie) {
    this.movieId = movieId;
    this.player = player;
    this.token = token;
    this.isSerie = isSerie;
    this.lastSavedTime = 0;
    this.saveInterval = 10000;

    this.init();
  }

  async init() {
    // Solo intentar cargar progreso si NO estamos en modo con anuncios
    // (porque en modo con anuncios ya lo maneja initAdPlayer)

    // Verificar si hay un savedTime en el player (seteado por initAdPlayer)
    if (this.player.userSavedTime) {
      console.log(
        'VideoProgressTracker: Usando tiempo del player.userSavedTime:',
        this.player.userSavedTime
      );
      return;
    }

    // Si no, cargar normalmente
    const savedTime = await this.fetchSavedProgress();
    if (savedTime > 0) {
      this.player.one('loadedmetadata', () => {
        const duration = this.player.duration();
        if (savedTime < duration - 5) {
          console.log('VideoProgressTracker aplicando tiempo:', savedTime);
          this.player.currentTime(savedTime);
        }
      });
    }

    this.setupEvents();
  }

  setupEvents() {
    setInterval(() => this.saveProgress(), this.saveInterval);

    this.player.on('pause', () => this.saveProgress());

    this.player.on('ended', () => this.clearProgress());

    window.addEventListener('beforeunload', () => this.saveProgress());
  }

  async fetchSavedProgress() {
    try {
      const url = this.isSerie
        ? `/api/serie-progress/${this.movieId}`
        : `/api/movie-progress/${this.movieId}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch progress');

      return await response.json();
    } catch (error) {
      console.error('Error fetching video progress:', error);
      return 0;
    }
  }

  async saveProgress() {
    if (this.player.ended()) return;

    const currentTime = Math.floor(this.player.currentTime());
    const duration = this.player.duration();

    // Evitar guardar cuando duration aún es inválida en series HLS
    if (!duration || isNaN(duration) || duration < 10) return;

    if (
      Math.abs(currentTime - this.lastSavedTime) < 5 ||
      duration - currentTime < 5
    )
      return;

    try {
      const url = this.isSerie ? `/api/serie-progress` : `/api/movie-progress`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          movie_id: this.movieId,
          progress_seconds: currentTime,
        }),
      });

      if (response.ok) {
        this.lastSavedTime = currentTime;
      }
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  }

  async clearProgress() {
    try {
      const url = this.isSerie
        ? `/api/serie-progress/${this.movieId}`
        : `/api/movie-progress/${this.movieId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.lastSavedTime = 0;
      }
    } catch (error) {
      console.error('Error eliminando progreso:', error);
    }
  }
}
