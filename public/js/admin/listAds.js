import { formatDuration } from '../modules/formatDuration.js';
import { deleteForm } from '../modules/deleteForm.js';
import { storageData } from '../modules/storageData.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';

async function listAds() {
  const listContent = document.getElementById('list-ads');
  const api = '/api/';
  const backendDeleteApi = '/api/delete-ads';
  const backendURL = '/';
  const authToken = localStorage.getItem('auth_token');

  // Cargar los datos al iniciar
  loadAdsList();

  // Función para cargar y mostrar los datos
  async function loadAdsList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
                    <div class="card shadow-sm">
                      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                          <h2 class="h5 mb-0"><i class="fas fa-ad me-2"></i> Lista de Anuncios</h2>
                          <a href="/admin/add-ad.html" class="add-button">Crear Anuncio</a>
                          </div>
                      <div class="card-body">
                          <div id="delete-ad-success-message" class="alert alert-success d-none mb-3"></div>
                          
                          <div class="table-responsive">
                              <table class="table table-striped table-hover table-bordered display datatable" style="width:100%">
                                  <thead class="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Marca</th>
                                    <th>Tipo</th>
                                    <th>Duración</th>
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
        ajax: {
          url: api + 'ads/datatable',
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
          { data: 'brand', name: 'brand' },
          {
            data: 'type',
            name: 'type',
            render: function (data) {
              if (data == 'application/vnd.apple.mpegurl') return 'HLS';
              else if (data == 'video/mp4') return 'MP4';
              else if (data == 'audio/mpeg') return 'MP3';
              else if (data == 'url_hls') return 'URL HLS';
              else if (data == 'url_mp4') return 'URL MP4';
              else if (data == 'url_mp3') return 'URL MP3';
              else if (data == 'youtube') return 'Youtube';
            },
          },
          {
            data: 'duration',
            name: 'duration',
            render: function (data) {
              if (data != null) return formatDuration(data);
              else return 'N/A';
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

          const message = document.getElementById('delete-ad-success-message');
          deleteForm(authToken, '.ads-delete-form', backendDeleteApi, message);
        },
      });
    } catch (error) {
      console.error('Error al cargar la lista de contenido:', error);
      listContent.innerHTML = `
                    <div class="alert alert-danger">
                        Error al cargar la lista de Anuncios: ${error.message}
                    </div>
                  `;
    }
  }
}

listAds();
