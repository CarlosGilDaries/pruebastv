import { deleteForm } from '../modules/deleteForm.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';

async function listTags() {
  const listContent = document.getElementById('list-tags');
  const api = '/api/';
  const authToken = localStorage.getItem('auth_token');
  const backendDeleteApi = '/api/delete-tag';

  // Cargar los datos al iniciar
  loadTagsList();

  // Función para cargar y mostrar los datos
  async function loadTagsList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
					<div class="add-button-container">
						<h1><i class="fa-solid fa-tag"></i> Lista de Etiquetas</h1>
						<a href="/admin/add-tag.html" class="add-button add-content">Crear Etiqueta</a>
					</div>
                    <div id="delete-tag-success-message" class="success-message" style="margin-bottom: 20px;">
                      ¡Etiqueta eliminado con éxito!
                    </div>    
                    <div class="table-responsive" id="tags-table">
                        <table class="content-table display datatable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
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
        ajax: {
          url: api + 'tags/datatable',
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

          const message = document.getElementById(
            'delete-tag-success-message'
          );
          deleteForm(
            authToken,
            '.tag-delete-form',
            backendDeleteApi,
            message
          );
        },
      });
    } catch (error) {
      console.error('Error al cargar la lista de etiquetas:', error);
      listContent.innerHTML = `
                    <div class="error-message">
                        Error al cargar la lista de etiquetas: ${error.message}
                    </div>
                `;
    }
  }
}

listTags();
