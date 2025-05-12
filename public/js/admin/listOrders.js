import { deleteForm } from "../modules/deleteForm.js";
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';


async function listOrders() {
    const listContent = document.getElementById('list-orders');
    const backendAPI = 'https://pruebastv.kmc.es/api/';
      const backendURL = 'https://pruebastv.kmc.es';
      const authToken = localStorage.getItem('auth_token');
		
    // Cargar los datos al iniciar
    loadOrdersList();

    // Función para cargar y mostrar los datos
    async function loadOrdersList() {
      try {
        const response = await fetch(backendAPI + 'orders', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });;

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        }

        const orders = data.orders;
		const allOrders = [...orders.planOrder, ...orders.ppvOrder];

        // Generar HTML de la tabla
          let tableHTML = `
		  			<div class="add-button-container">
                    	<h1><i class="fa-solid fa-file-invoice-dollar"></i> Lista de Pedidos</h1>
					</div>
                    <div id="delete-order-success-message" class="success-message" style="margin-bottom: 20px;">
                      ¡Pedido eliminado con éxito!
                    </div>    
                    <div class="table-responsive">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>Nº Pedido</th>
                                    <th>Cantidad</th>
                                    <th>Estado</th>
                                    <th>Usuario</th>
                                    <th>Descripción</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

        allOrders.forEach((order) => {
			console.log(order);
          	let status;
			let deleteFormClass;

          if (order.status == 'pending') {
            status = 'Pendiente';
          } 
		else if(order.status == 'paid') {
            status = 'Pagado';
		} else {
			status = 'Error';
		}
		
		if (order.plan) {
			deleteFormClass = 'plan-order-delete-form';
		} else {
			deleteFormClass = 'ppv-order-delete-form';
		}
            
        tableHTML += ` 
                    <tr>
                        <td>${order.reference}</td>
                        <td>${order.amount} €</td>
                        <td>${status}</td>
                        <td>${order.user.email}</td>
                        <td>${order.description}</td>
                        <td>
                            <div class="actions-container">
                                <button class="actions-button orders-button">Acciones</button>
                                <div class="actions-menu">
                                    <a href="#" class="action-item edit-button plan-action" data-id="${
                                        order.id
                                    }">Editar</a>
									<a href="#" class="action-item bill-button plan-action" data-id="${
                                        order.id
                                    }">Factura</a>
                                    <form class="${deleteFormClass}" data-id="${
                                        order.id
                                    }">
                                    <input type="hidden" name="plan_id" value="${
                                        order.id
                                    }">
                                    <button class="action-item content-action delete-btn" type="submit">Eliminar</button>
                                    </form>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
          }
        );

        tableHTML += `
                            </tbody>
                        </table>
                    </div>
                `;

        // Insertar la tabla en el DOM
        listContent.innerHTML = tableHTML;

      const links = document.querySelectorAll('.action-item');
      links.forEach((link) => {
        link.addEventListener('click', storageData);
      });

      // Configurar los menús de acciones
      setUpMenuActions();
		
        const message = document.getElementById('delete-order-success-message');
        deleteForm(authToken, '.plan-order-delete-form', 'https://pruebastv.kmc.es/api/delete-order', message);
		deleteForm(authToken, '.ppv-order-delete-form', 'https://pruebastv.kmc.es/api/delete-ppv-order', message);
      } catch (error) {
        console.error('Error al cargar la lista de pedidos:', error);
        listContent.innerHTML = `
                    <div class="error-message">
                        Error al cargar la lista de pedidos: ${error.message}
                    </div>
                `;
      }
    }
  }

listOrders();
