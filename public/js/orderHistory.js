import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { clickLogOut } from './modules/clickLogOutButton.js';

const categoriesDropDown = document.getElementById('categories');
const gendersDropDown = document.getElementById('genders');
const token = localStorage.getItem('auth_token');

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');
clickLogOut();

async function loadUserOrders() {
  try {
    const response = await fetch('/api/current-user-orders', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    if (data.success && data.orders.length > 0) {
      displayOrders(data.orders);
      setupDownloadButtons();
    } else {
      document.getElementById('user-orders').innerHTML =
        '<p>No se ha realizado ningún pago.</p>';
    }
  } catch (error) {
    console.error('Error al cargar los pedidos:', error);
    document.getElementById('user-orders').innerHTML =
      '<p>Error al cargar el historial de pagos.</p>';
  }
}

function displayOrders(orders) {
  const ordersContainer = document.getElementById('user-orders');

  // Ordenar por fecha más reciente primero
  const sortedOrders = orders.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const ordersHTML = sortedOrders
    .map(
      (order) => `
      <div class="order-card">
        <div class="order-info">
          <h3>${order.description}</h3>
          <p>${order.amount} €</p>
          <p>${formatDate(order.created_at)}</p>
        </div>
        <button class="bill-button" data-id="${
          order.id
        }">Descargar factura</button>
      </div>
    `
    )
    .join('');

  ordersContainer.innerHTML = ordersHTML;
}

function formatDate(dateString) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

function setupDownloadButtons() {
  document.querySelectorAll('.bill-button').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const orderId = this.dataset.id;

      fetch(`/bill-path/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.path) {
            window.open(`/${data.path}`, '_blank');
          } else {
            alert('Factura no disponible.');
          }
        })
        .catch((error) => {
          console.error('Error al descargar factura:', error);
          alert('Error al intentar descargar la factura.');
        });
    });
  });
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', loadUserOrders);
