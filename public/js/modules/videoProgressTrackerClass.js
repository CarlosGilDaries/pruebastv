export class VideoProgressTracker {
  constructor(movieId, player, token, isSerie) {
    this.movieId = movieId;
    this.player = player;
    this.token = token;
    this.isSerie = isSerie;
    this.lastSavedTime = 0;
    this.saveInterval = 10000; // Guardar cada 10 segundos

    this.init();
  }

  async init() {
    // Cargar progreso guardado al iniciar
    const savedTime = await this.fetchSavedProgress();
    if (savedTime > 0) {
      const duration = this.player.duration();
      this.player.currentTime(savedTime);

    }

    // Configurar eventos
    this.setupEvents();
  }

  setupEvents() {
    // Intervalo para guardar progreso
    setInterval(() => this.saveProgress(), this.saveInterval);

    // Guardar al pausar
    this.player.on('pause', () => this.saveProgress());

    // Eliminar progreso al finalizar
    this.player.on('ended', () => this.clearProgress());

    // Guardar al cerrar la página
    window.addEventListener('beforeunload', () => this.saveProgress());
  }

  async fetchSavedProgress() {
    try {
      let url;
      if (this.isSerie) {
        url = `/api/serie-progress/${this.movieId}`;
      } else {
        url = `/api/movie-progress/${this.movieId}`;
      }

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
    // No guardar si el video ha terminado
    if (this.player.ended()) return;

    const currentTime = Math.floor(this.player.currentTime());
    const duration = this.player.duration();

    // Solo guardar si ha cambiado significativamente
    if (
      Math.abs(currentTime - this.lastSavedTime) < 5 ||
      duration - currentTime < 5
    )
      return;

    try {
      let url;
      if (this.isSerie) {
        url = `/api/serie-progress`;
      } else {
        url = `/api/movie-progress`;
      }
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
      let url;
      if (this.isSerie) {
        url = `/api/serie-progress/${this.movieId}`;
      } else {
         url = `/api/movie-progress/${this.movieId}`;
      }
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Progreso eliminado al finalizar el video');
        this.lastSavedTime = 0;
      }
    } catch (error) {
      console.error('Error eliminando progreso:', error);
    }
  }
}

