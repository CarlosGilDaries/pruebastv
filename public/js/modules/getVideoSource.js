export function getVideoSource(movieType, movieUrl, backendUrl) {
  let type;
  let url;
  
  if (movieType == 'url_mp4') {
    type = 'video/mp4';
    url = movieUrl;
  } 
  else if (movieType == 'url_hls') {
    type = 'application/vnd.apple.mpegurl';
    url = movieUrl;
  }
  else if (movieType == 'youtube') {
    type = 'video/youtube';
    url = movieUrl;
  } else {
    type = movieType;
    url = backendUrl + movieUrl;
  }

  return { type, url };
}