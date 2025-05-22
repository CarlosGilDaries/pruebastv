import { deleteForm } from '../modules/deleteForm.js';
import { storageData } from '../modules/storageData.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';

async function listBills() {
  const listContent = document.getElementById('list-bills');
  const backendDeleteApi = 'https://pruebastv.kmc.es/api/delete-bill';
  const backendURL = 'https://pruebastv.kmc.es/';
  const authToken = localStorage.getItem('auth_token');
  const api = 'https://pruebastv.kmc.es/api/';

  // Cargar los datos al iniciar
  loadBillsList();

  // Función para cargar y mostrar los datos
  async function loadBillsList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
                    <div class="add-button-container">
                        <h1><i class="fa-solid fa-receipt"></i> Lista de Facturas</h1>
                    </div>
                    <div id="delete-bill-success-message" class="success-message" style="margin-bottom: 20px;">
                      ¡Factura eliminada con éxito!
                    </div>    
                    <div class="table-responsive">
                        <table class="content-table display datatable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nº Factura</th>
                                    <th>ID Usuario</th>
                                    <th>ID Pedido</th>
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
        order: [[6, 'asc']],
        ajax: {
          url: api + 'bills/datatable',
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
          { data: 'id', name: 'id' },
          { data: 'bill_number', name: 'bill_number' },
          { data: 'user_id', name: 'user_id' },
          { data: 'order_id', name: 'order_id' },
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

              fetch(`/bill-path/${orderId}`)
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
			
		document.querySelectorAll('.download-button').forEach((btn) => {
				btn.addEventListener('click', async function(e) {
					e.preventDefault();
					const id = this.dataset.id;
					const number = this.dataset.number;

					try {
						const downloadResponse = await fetch(`/bill/${id}/download`);

						if (!downloadResponse.ok) {
							throw new Error('Error al descargar la factura');
						}

						const blob = await downloadResponse.blob();
						const url = window.URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = url;
						a.download = `factura-${number}.pdf`;
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

          // Configurar los menús de acciones
          setUpMenuActions();

          const message = document.getElementById(
            'delete-bill-success-message'
          );
          deleteForm(authToken, '.bill-delete-form', backendDeleteApi, message);
        },
      });
    } catch (error) {
      console.error('Error al cargar la lista de facturas:', error);
      listContent.innerHTML = `
                    <div class="error-message">
                        Error al cargar la lista de facturas: ${error.message}
                    </div>
                `;
    }
  }
}

listBills();
