export async function signedUrl(token, movieId) {
	const urlResponse = await fetch(`/api/signed-url/${movieId}`, {
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