import { deleteForm } from '../modules/deleteForm.js';
import { storageData } from '../modules/storageData.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';

async function listBills() {
  const listContent = document.getElementById('list-bills');
  const backendDeleteApi = '/api/delete-bill';
  const backendURL = '/';
  const authToken = localStorage.getItem('auth_token');
  const api = '/api/';

  // Cargar los datos al iniciar
  loadBillsList();

  // Función para cargar y mostrar los datos
  async function loadBillsList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
                    <div class="card shadow-sm">
                      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                          <h2 class="h5 mb-0"><i class="fa-solid fa-receipt me-2"></i>Lista de Facturas</h2>
                      </div>
                      <div class="card-body">
                          <div id="delete-bill-success-message" class="alert alert-success d-none mb-3"></div>
                          
                          <div class="table-responsive">
                              <table class="table table-striped table-hover table-bordered display datatable" style="width:100%">
                                  <thead class="table-dark">
                                      <tr>
                                          <th>ID</th>
                                          <th>Nº Factura</th>
                                          <th>DNI Usuario</th>
                                          <th>Reference Pedido</th>
                                          <th>Cantidad</th>
                                          <th>Método de pago</th>
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
        responsive: true,
        scrollX: true,
        scrollY: true,
        processing: true,
        serverSide: true,
        order: [[7, 'asc']],
        ajax: {
          url: api + 'bills/datatable',
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
          { data: 'id', name: 'id' },
          { data: 'bill_number', name: 'bill_number' },
          { data: 'user_dni', name: 'user_dni' },
          { data: 'order_reference', name: 'order_reference' },
          { data: 'amount', name: 'amount' },
          { data: 'payment_method', name: 'payment_method' },
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
          url: '//datatables-cdn.com/plug-ins/1.10.25/i18n/Spanish.json',
          paginate: {
            first: `<span class="icon-pagination">«</span>`,
            previous: `<span class="icon-pagination">‹</span>`,
            next: `<span class="icon-pagination">›</span>`,
            last: `<span class="icon-pagination">»</span>`,
          },
        },
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
                <option value="0">ID</option>
                <option value="1">Nº Factura</option>
                <option value="2">DNI Usuario</option>
                <option value="3">Reference Pedido</option>
                <option value="4">Cantidad</option>
                <option value="5">Método de pago</option>
                <option value="6">Descripción</option>
                <option value="7">Fecha</option>
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
            btn.addEventListener('click', async function (e) {
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
                    <div class="alert alert-danger">
                        Error al cargar la lista de facturas: ${error.message}
                    </div>
                  `;
    }
  }
}

listBills();
