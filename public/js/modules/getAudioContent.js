export function getAudioContent(data, node, backendURL) {
  const audios = new Set();
	console.log(data);

  data.data.movies.forEach((element) => {
    if (element.type == 'audio/mpeg' || element.type == 'url_mp3') {
      audios.add(element);
    }
  });

  audios.forEach((audio) => {
    const article = document.createElement('article');
    article.classList.add('content');

    const link = document.createElement('a');
    link.href = `/content/${audio.slug}`;

    const img = document.createElement('img');
    img.src = backendURL + audio.cover;

    link.append(img);
    article.append(link);
    node.append(article);
  });

  return audios;
}
