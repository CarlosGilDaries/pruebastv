import { formatDuration } from '../modules/formatDuration.js';
import { deleteForm } from '../modules/deleteForm.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';

async function listContent() {
  const listContent = document.getElementById('list-content');
  const backendAPI = 'https://pruebastv.kmc.es/api/content-list';
  const backendDeleteApi = 'https://pruebastv.kmc.es/api/delete-content';
  const backendURL = 'https://pruebastv.kmc.es';
  const authToken = localStorage.getItem('auth_token');

  // Cargar los datos al iniciar
  loadContentList();

  // Función para cargar y mostrar los datos
  async function loadContentList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
					<div class="add-button-container">
						<h1><i class="fas fa-film"></i> Lista de Contenido</h1>
						<a href="/admin/add-content.html" class="add-button add-content">Crear Contenido</a>
					</div>
                    <div id="delete-content-success-message" class="success-message" style="margin-bottom: 20px;">
                      ¡Contenido eliminado con éxito!
                  </div>    
                    <div class="table-responsive">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Portada</th>
                                    <th>Género</th>
                                    <th>Tipo</th>
                                    <th>PPV</th>
                                    <th>Duración</th>
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
          url: api + 'content/datatable',
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
          { data: 'title', name: 'title' },
          { data: 'cover', name: 'cover' },
          { data: 'gender', name: 'gender' },
          { data: 'type', name: 'type' },
          { data: 'ppv', name: 'ppv' },
          { data: 'duration', name: 'duration' },
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

          // Configurar los menús de acciones
          setUpMenuActions();

          const message = document.getElementById(
            'delete-content-success-message'
          );
          deleteForm(
            authToken,
            '.content-delete-form',
            backendDeleteApi,
            message
          );
        },
      });
    } catch (error) {
      console.error('Error al cargar la lista de contenido:', error);
      listContent.innerHTML = `
                    <div class="error-message">
                        Error al cargar la lista de películas: ${error.message}
                    </div>
                `;
    }
  }
}

listContent();
