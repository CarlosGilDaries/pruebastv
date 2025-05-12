document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('auth_token');
	const email = localStorage.getItem('current_user_email');
	
    if (token == null) {
        window.location.href = '/login.html';
        return;
    }
   
    const plansList = document.querySelector('.plans-list');
    const message = document.querySelector('.message');
    const h2 = document.querySelector('h2');
    const actualPlan = localStorage.getItem('actual_plan');
    const neededPlans = [...new Set(localStorage.getItem('needed_plans').split(','))];
	const link = document.getElementById('link-to-plans');
	if (actualPlan) {
		h2.innerHTML = `Plan Actual - ${actualPlan}`;
		message.innerHTML = `No se puede visualizar este contenido con el plan actual. Plan/es necesarios:`;
		link.innerHTML = `CAMBIAR DE PLAN`;
	} else {
		h2.innerHTML = `Plan Actual - Ninguno`;
		message.innerHTML = `Plan/es para visualizar este contenido:`;
		link.innerHTML = `SUSCRIBIRSE A UN PLAN`
	}

    neededPlans.forEach((plan) => {
        const planElement = document.createElement('div');
        planElement.className = 'device-item plan-item';

        const planName = document.createElement('p');
        planName.className = 'device-name plan-name';
        planName.textContent = plan || 'Dispositivo sin nombre';

        planElement.appendChild(planName);
        plansList.appendChild(planElement);
    });
});