import { deleteForm } from '../modules/deleteForm.js';
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
                <div class="card shadow-sm">
                      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                          <h2 class="h5 mb-0"><i class="fa-solid fa-file-invoice-dollar me-2"></i>Lista de Pedidos</h2>
                      </div>
                      <div class="card-body">
                          <div id="delete-bill-success-message" class="alert alert-success d-none mb-3"></div>
                          
                          <div class="table-responsive">
                              <table class="table table-striped table-hover table-bordered display datatable" style="width:100%">
                                  <thead class="table-dark">
                        <thead>
                            <tr>
                                <th>Nº Pedido</th>
                                <th>Cantidad</th>
                                <th>Estado</th>
                                <th>DNI Usuario</th>
                                <th>Descripción</th>
                                <th>Fecha</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                    </div>
                      </div>
                </div>
            `;

      // Insertar la tabla en el DOM
      listContent.innerHTML = tableHTML;

      // Iniciando Datatable con Server-Side Processing
      const table = $('.datatable').DataTable({
        scrollX: true,
        scrollY: true,
        processing: true,
        serverSide: true,
        order: [[5, 'asc']],
        ajax: {
          url: '/api/orders/datatable',
          type: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          data: function (d) {
            // Enviar todos los parámetros de filtrado al servidor
            return {
              ...d,
              min_date: $('#min-date').val(),
              max_date: $('#max-date').val(),
              column_filter: $('#column-filter').val(),
              search_term: $('#dt-search-0').val(),
              column_search: $('#column-filter').val()
                ? {
                    index: $('#column-filter').val(),
                    value: $('.dataTables_filter input').val(),
                  }
                : null,
            };
          },
          error: function (xhr) {
            if (xhr.status === 401) {
              alert('Sesión expirada. Por favor, inicie sesión nuevamente.');
              window.location.href = '/login';
            } else if (xhr.status === 403) {
              alert('No tienes los permisos necesarios.');
              window.location.href = '/';
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
        layout: {
          topStart: 'pageLength',
          topEnd: ['search', 'buttons'],
          bottomStart: 'info',
          bottomEnd: 'paging',
        },
        initComplete: function () {
          const filterContainer = $(`<div class="filter-container"></div>`);

          // Crear select de columnas para filtrar
          const columnFilter = $(`
            <label class="filter" style="margin-left: 20px;">
              Campo:
              <select class="filter-input select-filter" id="column-filter" style="width:150px;">
                <option value="">-- Todos --</option>
                <option value="0">Nº Pedido</option>
                <option value="1">Cantidad</option>
                <option value="2">Estado</option>
                <option value="3">DNI Usuario</option>
                <option value="4">Descripción</option>
                <option value="5">Fecha</option>
              </select>
            </label>
          `);

          // Filtro de fechas
          const dateFilter =
            $(`<label class="filter" style="margin-left: 20px;">Desde: <input class="filter-input" type="text" id="min-date" placeholder="dd-mm-yyyy" style="width:120px;"></label>
              <label class="filter" style="margin-left: 20px;">Hasta: <input class="filter-input" type="text" id="max-date" placeholder="dd-mm-yyyy" style="width:120px;"></label>`);

          // Botón para limpiar filtros
          const button = $(`<button class="clean-btn">Limpiar</button>`);

          const topContainer = $(
            '#DataTables_Table_0_wrapper > div:nth-child(1)'
          );
          const searchInput = $('#dt-search-0');
          const excelButton = $('.dt-buttons');

          filterContainer.append(columnFilter);
          filterContainer.append(dateFilter);

          // Insertar el filtro justo después del primer hijo
          filterContainer.insertAfter(topContainer.children().first());

          button.insertAfter(excelButton.children().first());

          // Configurar datepicker para los campos de fecha
          $('#min-date, #max-date').datepicker({
            dateFormat: 'dd-mm-yy',
            changeMonth: true,
            changeYear: true,
          });

          // Manejar cambios en los filtros para redibujar automáticamente
          $('#column-filter, #min-date, #max-date').on('change', function () {
            table.draw();
          });

          // Evento para limpiar filtros
          button.on('click', function () {
            // Reiniciar valores
            searchInput.val(''); // Input de búsqueda principal
            $('#column-filter').val(''); // Selector de columna
            $('#min-date').val(''); // Fecha desde
            $('#max-date').val(''); // Fecha hasta

            // Reiniciar búsquedas en DataTable
            table.search(''); // Limpiar búsqueda global
            table.columns().search(''); // Limpiar búsquedas por columna

            // Redibujar la tabla
            table.draw();

            // Cerrar datepicker si está abierto
            $('#min-date, #max-date').datepicker('hide');
          });
        },
        buttons: [
          {
            extend: 'excel',
            text: 'Excel',
            className: 'btn btn-success',
            exportOptions: {
              modifier: {
                search: 'applied',
                order: 'applied',
              },
              columns: ':not(:last-child)', // Excluye la columna de acciones
            },
          },
        ],

        drawCallback: function () {
          const searchInput = document.querySelector(
            '#DataTables_Table_0_wrapper > div:nth-child(1) > div.dt-layout-cell.dt-layout-end > div > label'
          );

          if (searchInput) {
            searchInput.innerHTML = 'Filtro:';
          }

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
          if (message) {
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
          }
        },
      });
    } catch (error) {
      console.error('Error al cargar la lista de pedidos:', error);
      listContent.innerHTML = `
                    <div class="alert alert-danger">
                        Error al cargar la lista de pedidos: ${error.message}
                    </div>
                  `;
    }
  }
}

listOrders();
