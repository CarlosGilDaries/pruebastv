import { skippableAd } from './skippableAd.js';
import { getVideoSource } from './getVideoSource.js';

export function setupPostroll(player, movieUrl, movieType, ads, movieId, token) {
	const postroll = ads.find((ad) => ad.ad_movie_type === 'postroll');
	const { type, url } = getVideoSource(movieType, movieUrl, movieId, token);

	if (!postroll) {
		player.trigger('nopostroll');
		return;
	}

	player.one('contentended', function () {
		player.on('readyforpostroll', function () {
			player.ads.startLinearAdMode();
			player.src({
				src: postroll.src,
				type: postroll.type,
			});

			player.one('adplaying', function () {
				document.querySelector("#my-video > div.vjs-back-button-container").style.display = 'none';
				player.trigger('ads-ad-started');
				skippableAd(player, postroll);
			});

			player.one('adended', function () {
				document.querySelector("#my-video > div.vjs-back-button-container").style.display = 'flex';
				player.ads.endLinearAdMode();
				player.trigger('ended');
			});
		});
	});
}
