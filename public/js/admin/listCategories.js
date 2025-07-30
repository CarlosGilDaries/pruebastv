import { deleteForm } from '../modules/deleteForm.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';

async function listCategories() {
  const listContent = document.getElementById('list-categories');
  const api = '/api/';
  const backendURL = '/';
  const authToken = localStorage.getItem('auth_token');
  const backendDeleteApi = '/api/delete-category';

  // Cargar los datos al iniciar
  loadCategoriesList();

  // Función para cargar y mostrar los datos
  async function loadCategoriesList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
                    <div class="card shadow-sm">
                      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                          <h2 class="h5 mb-0"><i class="fa-solid fa-layer-group me-2"></i> Lista de Categorías</h2>
                          <a href="/admin/add-category.html" class="add-button">Crear Categoría</a>
                          </div>
                      <div class="card-body">
                          <div id="delete-category-success-message" class="alert alert-success d-none mb-3"></div>
                          
                          <div class="table-responsive">
                              <table class="table table-striped table-hover table-bordered display datatable" style="width:100%">
                                  <thead class="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Prioridad</th>
                                    <th>Nombre</th>
                                    <th>Mostrar en Inicio</th>
                                    <th>Acciones</th>
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
        processing: true,
        serverSide: true,
        order: [[1, 'asc']],
        ajax: {
          url: api + 'categories/datatable',
          type: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
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
          { data: 'priority', name: 'priority' },
          { data: 'name', name: 'name' },
          {
            data: 'render',
            name: 'render',
            render: function (data) {
              if (data == 0) return 'No';
              else return 'Sí';
            },
          },
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
        responsive: true,
        scrollX: true,
        scrollY: true,
        layout: {
          topStart: 'pageLength',
          topEnd: ['search', 'buttons'],
          bottomStart: 'info',
          bottomEnd: 'paging',
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
          // Configurar eventos después de que se dibuja la tabla
          const links = document.querySelectorAll('.action-item');
          links.forEach((link) => {
            link.addEventListener('click', storageData);
          });

          // Configurar los menús de acciones
          setUpMenuActions();

          const message = document.getElementById(
            'delete-category-success-message'
          );
          deleteForm(
            authToken,
            '.category-delete-form',
            backendDeleteApi,
            message
          );
        },
      });
    } catch (error) {
      console.error('Error al cargar la lista de categorías:', error);
      listContent.innerHTML = `
                    <div class="error-message">
                        Error al cargar la lista de géneros: ${error.message}
                    </div>
                `;
    }
  }
}

listCategories();