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

async function setupDownloadButtons() {
  const buttons = document.querySelectorAll('.bill-button');

  for (const btn of buttons) {
    const id = btn.dataset.id;

    const billResponse = await fetch(`/api/get-bill/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const billData = await billResponse.json();
    let billId = '';
    let billNumber = '';
    if (billData.bill != null) {
      billId = billData.bill.id;
      billNumber = billData.bill.bill_number;
    }

    btn.addEventListener('click', async function (e) {
      e.preventDefault();

      try {
        const downloadResponse = await fetch(`/bill/${billId}/download`);

        if (!downloadResponse.ok) {
          throw new Error('Error al descargar la factura');
        }

        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${billNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error:', error);
        alert(error.message);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', loadUserOrders);
