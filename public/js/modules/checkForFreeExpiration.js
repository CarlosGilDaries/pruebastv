export async function resetFreeExpiration(token) {
    const resetResponse = await fetch('/api/reset-free-expiration', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
}