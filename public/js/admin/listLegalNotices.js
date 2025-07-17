import { deleteForm } from '../modules/deleteForm.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';

async function listLegalNotices() {
  const listContent = document.getElementById('list-legal-notices');
  const api = '/api/';
  const authToken = localStorage.getItem('auth_token');
  const backendDeleteApi = '/api/delete-legal-notice';

  // Cargar los datos al iniciar
  loadLegalNoticesList();

  // Función para cargar y mostrar los datos
  async function loadLegalNoticesList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
					<div class="add-button-container">
						<h1><i class="fas fa-rocket"></i> Lista de Avisos Legales</h1>
						<a href="/admin/add-legal-notice.html" class="add-button add-content">Crear Aviso Legal</a>
					</div>
                    <div id="delete-legal-notice-success-message" class="success-message" style="margin-bottom: 20px;">
                      ¡Aviso Legal eliminado con éxito!
                    </div>    
                    <div class="table-responsive" id="legal-notices-table">
                        <table class="content-table display datatable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
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
          url: api + 'legal-notice/datatable',
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
          { data: 'title', name: 'title' },
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
            'delete-legal-notice-success-message'
          );
          deleteForm(
            authToken,
            '.legal-notice-delete-form',
            backendDeleteApi,
            message
          );
        },
      });
    } catch (error) {
      console.error('Error al cargar la lista de Aviso Legals:', error);
      listContent.innerHTML = `
                    <div class="error-message">
                        Error al cargar la lista de Aviso Legals: ${error.message}
                    </div>
                `;
    }
  }
}

listLegalNotices();
