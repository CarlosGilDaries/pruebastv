export function adminCheck(token) {
    const backendAPI = '/api/';
    
    fetch(backendAPI + 'user', {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                const user = data.data.user;

                if (user.rol != 'admin') {
                    window.location.href = '/';
					condole.log(user);
                }
            }
        })
    .catch((error) => {
        console.log(error);
    });
}