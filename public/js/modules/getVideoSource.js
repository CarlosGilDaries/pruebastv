import { signedUrl } from './signedUrl.js';

export async function getVideoSource(movieType, movieUrl, movieId, token) {
	let type;
	let url;

	if (movieType == 'url_mp4') {
		type = 'video/mp4';
		url = await signedUrl(token, movieId);
	} 
	else if (movieType == 'url_hls') {
		type = 'application/vnd.apple.mpegurl';
		url = await signedUrl(token, movieId);
	}
	else if (movieType == 'url_mp3') {
		type = 'audio/mpeg';
		url = await signedUrl(token, movieId);
	}
	else if (movieType == 'youtube') {
		type = 'video/youtube';
		url = await signedUrl(token, movieId);
	} else {
		type = movieType;
		url = movieUrl;
	}

	return { type, url };
}