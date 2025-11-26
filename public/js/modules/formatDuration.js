// Función para formatear la duración
export function formatDuration(content) {
  let serie = false;
  let seasons = false;
  if (content.series && content.series.length != 0) {
    serie = true;
    if (Object.keys(content.series_by_season).length > 1) {
      seasons = true;
    }
  }

  if (!content.duration && !serie) return 'N/A';

  if (!serie) {
    const [hours, minutes, seconds] = content.duration.split(':');
    return `${parseInt(hours)}h ${minutes}m ${seconds}s`;

  } else {
    let durationType;
    if (!seasons) {
      durationType = `${content.series.length} <span data-i18n="episodes_line">Episodios</span>`;
    } else {
      durationType = `${
        Object.keys(content.series_by_season).length
      } <span data-i18n="seasons_line">Temporadas</span>`;
    }
    return durationType;
  }
}