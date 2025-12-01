//Función para comprobar si es una serie y darle url
export function resourceUrl(content) {
  let url;
  if (content.serie == 1) {
    url = `/player/episode/${content.series_by_season[0][0].id}`;
  } else {
    url = `/player/content/${content.id}`;
  }

  return url;
}
