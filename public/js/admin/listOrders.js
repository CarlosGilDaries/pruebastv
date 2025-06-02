import { deleteForm } from "../modules/deleteForm.js";
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';

async function listOrders() {
  const listContent = document.getElementById('list-orders');
  const authToken = localStorage.getItem('auth_token');
  const api = '/api/';

  // Cargar los datos al iniciar
  loadOrdersList();

  async function loadOrdersList() {
    try {	
      // Generar HTML del contenedor de la tabla
      let tableHTML = `
                <div class="add-button-container">
                    <h1><i class="fa-solid fa-file-invoice-dollar"></i> Lista de Pedidos</h1>
                </div>
                <div id="delete-order-success-message" class="success-message" style="margin-bottom: 20px;">
                    ¡Pedido eliminado con éxito!
                </div>    
                <div class="table-responsive">
                    <table class="content-table display datatable">
                        <thead>
                            <tr>
                                <th>Nº Pedido</th>
                                <th>Cantidad</th>
                                <th>Estado</th>
                                <th>DNI Usuario</th>
                                <th>Descripción</th>
								<th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            `;

      // Insertar la tabla en el DOM
      listContent.innerHTML = tableHTML;

      // Iniciando Datatable con Server-Side Processing
      const table = $('.datatable').DataTable({
        processing: true,
        serverSide: true,
        order: [[5, 'asc']],
        ajax: {
          url: api + 'orders/datatable',
          type: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          error: function (xhr) {
            if (xhr.status === 401) {
              alert('Sesión expirada. Por favor, inicie sesión nuevamente.');
              window.location.href = '/login';
            }
          },
        },
        columns: [
          { data: 'reference', name: 'reference' },
          { data: 'amount', name: 'amount' },
          { data: 'status', name: 'status' },
          { data: 'user_dni', name: 'user_dni' },
          { data: 'description', name: 'description' },
          { data: 'created_at', name: 'created_at' },
          {
            data: 'actions',
            name: 'actions',
            orderable: false,
            searchable: false,
          },
        ],
        language: {
          url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json',
          paginate: {
            first: `<span class="icon-pagination">«</span>`,
            previous: `<span class="icon-pagination">‹</span>`,
            next: `<span class="icon-pagination">›</span>`,
            last: `<span class="icon-pagination">»</span>`,
          },
        },
        responsive: true,
        drawCallback: function () {
          // Configurar eventos después de que se dibuja la tabla
          const links = document.querySelectorAll('.action-item');
          links.forEach((link) => {
            link.addEventListener('click', storageData);
          });

          document.querySelectorAll('.bill-button').forEach((btn) => {
            btn.addEventListener('click', function (e) {
              e.preventDefault();
              const orderId = this.dataset.id;

              fetch(`/bill-path-from-order/${orderId}`)
                .then((res) => res.json())
                .then((data) => {
                  if (data.path) {
                    window.open(`/${data.path}`, '_blank');
                  } else {
                    alert('Factura no disponible.');
                  }
                });
            });
          });

          document.querySelectorAll('.download-btn').forEach((btn) => {
            btn.addEventListener('click', async function (e) {
              e.preventDefault();
              const orderId = this.dataset.id;

              try {
                const billResponse = await fetch(
                  `/bill-path-from-order/${orderId}`
                );
                const billData = await billResponse.json();

                if (!billResponse.ok) {
                  throw new Error(
                    billData.message || 'Error al obtener la factura'
                  );
                }

                if (!billData.path) {
                  alert('Factura no disponible');
                  return;
                }

                const downloadResponse = await fetch(
                  `/bill/${billData.id}/download`
                );

                if (!downloadResponse.ok) {
                  throw new Error('Error al descargar la factura');
                }

                const blob = await downloadResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `factura-${billData.number}.pdf`;
                console.log(`factura-${billData.number}.pdf`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              } catch (error) {
                console.error('Error:', error);
                alert(error.message);
              }
            });
          });

          setUpMenuActions();

          const message = document.getElementById(
            'delete-order-success-message'
          );
          deleteForm(
            authToken,
            '.plan-order-delete-form',
            api + 'delete-order',
            message
          );
          deleteForm(
            authToken,
            '.ppv-order-delete-form',
            api + 'delete-ppv-order',
            message
          );
        },
      });
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
