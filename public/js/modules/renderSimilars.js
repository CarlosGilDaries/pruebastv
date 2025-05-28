

export async function renderSimilars(content, api, backendURL, token) {
	const response = await fetch(api + `gender/${content.gender_id}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	const data = await response.json();
	console.log(data);
	const similars = document.getElementById('similar');

	data.gender.movies.forEach((movie) => {
		if (movie.id != content.id) {
			const article = document.createElement('article');
			article.classList.add('content');

			const link = document.createElement('a');
			link.href = `/content/${movie.slug}`;

			const img = document.createElement('img');
			img.src = backendURL + movie.cover;

			link.append(img);
			article.append(link);
			similars.append(article);
		}
	});
}