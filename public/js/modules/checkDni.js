export async function checkDni(token) {
    try {
        const response = await fetch('/api/plans');
        if (token != null) {
            const userResponse = await fetch('/api/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const userData = await userResponse.json();

            if (userData.data.user.dni == null) {
              window.location.href = '/datos-de-facturacion';
              return false;
            } else {
              return true;
            }
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
}