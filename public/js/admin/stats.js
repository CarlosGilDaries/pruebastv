const token = localStorage.getItem('auth_token');
const backendAPI = 'https://pruebastv.kmc.es/api/';

document.addEventListener('DOMContentLoaded', function() {
	// Función para hacer peticiones con token
	async function fetchWithToken(url, needsToken = false) {
		const headers = {};
		if (needsToken) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		try {
			const response = await fetch(backendAPI + url, { headers });
			if (!response.ok) throw new Error('Error en la petición');
			return await response.json();
		} catch (error) {
			console.error('Error:', error);
			return null;
		}
	}

	// Función para contar tipos de contenido
	async function countContentTypes() {
		const data = await fetchWithToken('content');
		if (!data || !data.data || !data.data.movies) return;

		const movies = data.data.movies;
		let localMp4 = 0, localHls = 0, localMp3 = 0, externalUrls = 0, ppvContent = 0;

		movies.forEach(movie => {
			if (movie.pay_per_view) ppvContent++;

			if (movie.type === 'video/mp4') localMp4++;
			else if (movie.type === 'audio/mpeg') localMp3++;
			else if (movie.type === 'application/vnd.apple.mpegurl') localHls++;
			else externalUrls++;
		});

		document.getElementById('local-mp4-count').textContent = localMp4;
		document.getElementById('local-hls-count').textContent = localHls;
		document.getElementById('local-mp3-count').textContent = localMp3;
		document.getElementById('external-urls-count').textContent = externalUrls;
		document.getElementById('ppv-content-count').textContent = ppvContent;
	}

	// Función para obtener estadísticas de usuarios y suscripciones
	async function getUserStats() {
		const [usersData, plansData, ordersData] = await Promise.all([
			fetchWithToken('users', true),
			fetchWithToken('plans'),
			fetchWithToken('orders', true)
		]);
		let admins = 0;

		if (usersData && usersData.users) {
			usersData.users.forEach(user => {
				if (user.rol == 'admin') {
					admins++;
				}
			});
			document.getElementById('users-count').textContent = usersData.users.length - admins;
			renderPlansChart(usersData.users, admins, plansData);
		}

		if (ordersData) {
			let totalSubscriptions = 0;
			let totalPPV = 0;
			ordersData.orders.planOrder.forEach(order => {
				if (order.status == 'paid') {
					totalSubscriptions += Number(order.amount);
				}
			});
			document.getElementById('subscriptions-amount').textContent = `${totalSubscriptions.toFixed(2)} €`;
			
			ordersData.orders.ppvOrder.forEach(order => {
				if (order.status == 'paid') {
					totalPPV += Number(order.amount);
				}
			});
			document.getElementById('ppv-amount').textContent = `${totalPPV.toFixed(2)} €`;
		}
	}

	// Función para renderizar el gráfico de planes
	function renderPlansChart(users, admins, plansData) {
		if (!users || !plansData || !plansData.plans) return;

		const planCounts = {};
		const planColors = {};
		const planNames = {};

		// Inicializar contadores
		plansData.plans.forEach(plan => {
			planCounts[plan.id] = 0;
			planColors[plan.id] = getRandomColor();
			planNames[plan.id] = plan.name;
		});

		// Contar usuarios por plan
		users.forEach(user => {
			if (user.plan && user.plan.id) {
				planCounts[user.plan.id]++;
			}
		});

		// Filtrar planes con al menos un usuario
		const labels = [];
		const data = [];
		const backgroundColors = [];
		const legendItems = [];

		Object.keys(planCounts).forEach(planId => {
			if (planCounts[planId] > 0) {
				labels.push(planNames[planId]);
				data.push(planCounts[planId]);
				backgroundColors.push(planColors[planId]);

				legendItems.push({
					name: planNames[planId],
					color: planColors[planId],
					count: planCounts[planId]
				});
			}
		});

		// Renderizar gráfico
		const ctx = document.getElementById('plansChart').getContext('2d');
		new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: labels,
				datasets: [{
					data: data,
					backgroundColor: backgroundColors,
					borderWidth: 1
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					}
				}
			}
		});

		// Renderizar leyenda
		const legendContainer = document.getElementById('chart-legend');
		legendContainer.innerHTML = '';

		legendItems.forEach(item => {
			const legendItem = document.createElement('div');
			legendItem.className = 'legend-item';

			const colorBox = document.createElement('div');
			colorBox.className = 'legend-color';
			colorBox.style.backgroundColor = item.color;

			const text = document.createElement('span');
			text.textContent = `${item.name}: ${item.count} usuarios (${((item.count / (users.length - admins)) * 100).toFixed(1)}%)`;

			legendItem.appendChild(colorBox);
			legendItem.appendChild(text);
			legendContainer.appendChild(legendItem);
		});
	}

	// Función auxiliar para generar colores aleatorios (sin cambios)
	function getRandomColor() {
		const letters = '0123456789ABCDEF';
		let color = '#';
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	// Cargar todos los datos
	countContentTypes();
	getUserStats();
});
