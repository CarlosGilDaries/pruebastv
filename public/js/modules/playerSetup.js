import { getVideoSource } from './getVideoSource.js';

export function setupPlayer(player, movieUrl, backendUrl, movieType) {
	const { type, url } = getVideoSource(movieType, movieUrl, backendUrl);

	player.src({
		src: url,
		type: type,
	});

	// Inicializar ads
	player.ads();

	// Manejar reinicio después de contentended
	player.on('contentended', function () {
		player.one('play', function () {
			player.currentTime(0);
			player.play();
		});
	});

	return player;
}
