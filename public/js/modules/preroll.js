import { skippableAd } from './skippableAd.js';
import { getVideoSource } from './getVideoSource.js';

export function setupPreroll(player, movieUrl, backendUrl, movieType, ads) {
	const preroll = ads.find((ad) => ad.ad_movie_type === 'preroll');
	const { type, url } = getVideoSource(movieType, movieUrl, backendUrl);

	if (!preroll) {
		player.trigger('nopreroll');
		return;
	}		

	player.on('readyforpreroll', function () {
		player.ads.startLinearAdMode();
		player.src({
			src: backendUrl + preroll.src,
			type: preroll.type,
		});

		// Cuando el anuncio empiece, quitar el loader
		player.one('adplaying', function () {
			player.trigger('ads-ad-started');
			skippableAd(player, preroll);
		});

		player.one('adended', function () {
			player.ads.endLinearAdMode();
			player.src({
				src: url,
				type: type,
			});
		});
	});
}
