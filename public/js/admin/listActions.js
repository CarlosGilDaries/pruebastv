import { deleteForm } from '../modules/deleteForm.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';

async function listActions() {
  const listContent = document.getElementById('list-actions');
  const api = '/api/';
  const backendURL = '/';
  const authToken = localStorage.getItem('auth_token');
  const backendDeleteApi = '/api/delete-action';

  // Cargar los datos al iniciar
  loadActionsList();

  // Función para cargar y mostrar los datos
  async function loadActionsList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
                    <div class="card shadow-sm">
                      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                          <h2 class="h5 mb-0"><i class="fa-solid fa-location-crosshairs me-2"></i>Lista de LLamadas a la Acción</h2>
                          <a href="/admin/add-action.html" class="add-button">Crear Acción</a>
                          </div>
                      <div class="card-body">
                          <div id="delete-action-success-message" class="alert alert-success d-none mb-3"></div>
                          
                          <div class="table-responsive">
                              <table class="table table-striped table-hover table-bordered display datatable" style="width:100%">
                                  <thead class="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Orden</th>
                                    <th>Nombre</th>
                                    <th>Imagen</th>
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
        responsive: true,
        scrollX: true,
        scrollY: true,
        processing: true,
        serverSide: true,
        order: [[1, 'asc']],
        ajax: {
          url: api + 'actions/datatable',
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
          { data: 'order', name: 'order' },
          { data: 'name', name: 'name' },
          {
            data: 'picture',
            name: 'picture',
            render: function (data) {
              return `<img src="${data}" class="datatable-img">`;
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
          url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json',
          paginate: {
            first: `<span class="icon-pagination">«</span>`,
            previous: `<span class="icon-pagination">‹</span>`,
            next: `<span class="icon-pagination">›</span>`,
            last: `<span class="icon-pagination">»</span>`,
          },
        },
        drawCallback: function () {
          // Configurar eventos después de que se dibuja la tabla
          const links = document.querySelectorAll('.action-item');
          links.forEach((link) => {
            link.addEventListener('click', storageData);
          });

          // Configurar los menús de acciones
          setUpMenuActions();

          const message = document.getElementById('success-message');
          deleteForm(
            authToken,
            '.action-delete-form',
            backendDeleteApi,
            message
          );
        },
      });
    } catch (error) {
      console.error('Error al cargar la lista de acciones:', error);
      listContent.innerHTML = `
                    <div class="alert alert-danger">
                        Error al cargar la lista de Acciones: ${error.message}
                    </div>
                  `;
    }
  }
}

listActions();