export async function signedUrl(token, movieId, serie) {
	const urlResponse = await fetch(`/api/signed-url/${movieId}/${serie}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		credentials: 'include'
	});

	const urlData = await urlResponse.json();
	const signedUrl = urlData.url;
	
	return signedUrl;
}