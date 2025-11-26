// Función para formatear la duración
export function formatDuration(content) {
  let serie = false;
  let seasons = false;

  if (content.series && content.series.length !== 0) {
    serie = true;
    if (Object.keys(content.series_by_season).length > 1) {
      seasons = true;
    }
  }

  // Caso: no es serie y no tiene duración
  if (!content.duration && !serie) return 'N/A';

  // -------------------------------------
  //  FORMATEAR DURACIÓN DE UNA PELÍCULA
  // -------------------------------------
  if (!serie) {
    const [hoursStr, minutesStr, secondsStr] = content.duration.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);

    let result = [];

    if (hours > 0) result.push(`${hours} h`);
    if (minutes > 0) result.push(`${minutes} min`);
    if (seconds > 0) result.push(`${seconds} s`);

    // Si todo era 0 → N/A
    if (result.length === 0) return 'N/A';

    return result.join(' ');
  }

  // -------------------------------------
  //  ES UNA SERIE
  // -------------------------------------
  if (!seasons) {
    return `${content.series.length} <span data-i18n="episodes_line">Episodio</span>s`;
  } else {
    return `${
      Object.keys(content.series_by_season).length
    } <span data-i18n="seasons_line">Temporada</span>s`;
  }
}
