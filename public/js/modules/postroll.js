import { skippableAd } from './skippableAd.js';
import { getVideoSource } from './getVideoSource.js';

export function setupPostroll(player, movieUrl, backendUrl, movieType, ads, movieId, token) {
	const postroll = ads.find((ad) => ad.ad_movie_type === 'postroll');
	const { type, url } = getVideoSource(movieType, movieUrl, backendUrl, movieId, token);

	if (!postroll) {
		player.trigger('nopostroll');
		return;
	}

	player.one('contentended', function () {
		player.on('readyforpostroll', function () {
			player.ads.startLinearAdMode();
			player.src({
				src: backendUrl + postroll.src,
				type: postroll.type,
			});

			player.one('adplaying', function () {
				player.trigger('ads-ad-started');
				skippableAd(player, postroll);
			});

			player.one('adended', function () {
				player.ads.endLinearAdMode();
				player.trigger('ended');
			});
		});
	});
}
