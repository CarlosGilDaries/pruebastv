import { getVideoSource } from './getVideoSource.js';

export async function setupPlayer(player, movieUrl, movieType, movieId, token) {
	const { type, url } = await getVideoSource(movieType, movieUrl, movieId, token);

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
