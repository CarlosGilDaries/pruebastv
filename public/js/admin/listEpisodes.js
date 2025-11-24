import { deleteForm } from '../modules/deleteForm.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';

async function listEpisodes() {
  const listEpisodes = document.querySelector('.list-episodes');
  const api = '/api/';
  const backendDeleteApi = `/api/delete-episode`;
  const authToken = localStorage.getItem('auth_token');
  let id = localStorage.getItem('serie-id');
  let title = localStorage.getItem('title');
  document.title = `Episodios de ${title}`;

  // Cargar los datos al iniciar
  loadEpisodesList();

  // Función para cargar y mostrar los datos
  async function loadEpisodesList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
                    <div class="card shadow-sm">
                      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                          <h2 class="h5 mb-0"><i class="fa-solid fa-atom me-2"></i>Lista de Episodios de ${title}</h2>
                          <a href="/admin/add-episode.html" class="add-button">Crear Episodio</a>
                          </div>
                      <div class="card-body">
                          <div id="delete-content-success-message" class="alert alert-success d-none mb-3"></div>
                          
                          <div class="table-responsive">
                              <table class="table table-striped table-hover table-bordered display datatable" style="width:100%">
                                  <thead class="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Portada</th>
                                    <th>Nº Temporada</th>
                                    <th>Nº Episodio</th>
                                    <th>Subida</th>
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
      listEpisodes.innerHTML = tableHTML;

      // Iniciando Datatable con Server-Side Processing
      const table = $('.datatable').DataTable({
        responsive: true,
        scrollX: true,
        scrollY: true,
        processing: true,
        serverSide: true,
        order: [],
        ajax: {
          url: api + `episodes/${id}/datatable`,
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
            data: 'cover',
            name: 'cover',
            render: function (data) {
              if (data != null)
                return `<img src="${data}" class="datatable-img">`;
              else return 'N/A';
            },
          },
          { data: 'season_number', name: 'season_number' },
          { data: 'episode_number', name: 'episode_number' },
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
      listEpisodes.innerHTML = `
                    <div class="alert alert-danger">
                        Error al cargar la lista de Contenido: ${error.message}
                    </div>
                  `;
    }
  }
}

listEpisodes();
