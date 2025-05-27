import { addScrollFunctionality } from "./addScrollFunctionality.js";

export function getVideoContent(data, node, backendURL) {
  const videos = new Set();

  data.forEach((element) => {
    if (element.type != 'audio/mpeg' || element.type != 'url_mp3') {
      videos.add(element);
    }
  });

  videos.forEach((video) => {
    const article = document.createElement('article');
    article.classList.add('content');

    const link = document.createElement('a');
    link.href = `/content/${video.slug}`;

    const img = document.createElement('img');
    img.src = backendURL + video.cover;

    link.append(img);
    article.append(link);
    node.append(article);
  });

  addScrollFunctionality(node, 300);
}
