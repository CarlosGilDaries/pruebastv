import { deleteForm } from '../modules/deleteForm.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';

async function listFooterItems() {
  const listContent = document.getElementById('list-footer-items');
  const api = '/api/';
  const backendURL = '/';
  const authToken = localStorage.getItem('auth_token');
  const backendDeleteApi = '/api/delete-footer-item';

  // Cargar los datos al iniciar
  loadFooterItemsList();

  // Función para cargar y mostrar los datos
  async function loadFooterItemsList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
                    <div class="add-button-container">
                        <h1><i class="fa-solid fa-shoe-prints"></i> Lista de Items</h1>
                        <a href="/admin/add-footer-item.html" class="add-button add-footer-item">Crear Item</a>
                    </div>
                    <div id="success-message" class="success-message" style="margin-bottom: 20px;">
                      ¡Item eliminada con éxito!
                    </div>    
                    <div class="table-responsive" id="footer-items-table">
                        <table class="content-table display datatable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Logo</th>
                                    <th>Url</th>
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
        order: [[1, 'asc']],
        ajax: {
          url: api + 'footer-items/datatable',
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
          { data: 'name', name: 'name' },
          {
            data: 'logo',
            name: 'logo',
            render: function (data) {
              return `<img src="${data}">`;
            },
          },
          { data: 'url', name: 'url' },
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

          // Configurar los menús de acciones
          setUpMenuActions();

          const message = document.getElementById('success-message');
          deleteForm(
            authToken,
            '.footer-item-delete-form',
            backendDeleteApi,
            message
          );
        },
      });
    } catch (error) {
      console.error('Error al cargar la lista de items:', error);
      listContent.innerHTML = `
                    <div class="error-message">
                        Error al cargar la lista de items: ${error.message}
                    </div>
                `;
    }
  }
}

listFooterItems();