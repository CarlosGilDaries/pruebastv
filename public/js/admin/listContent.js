import { deleteForm } from '../modules/deleteForm.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';

async function listContent() {
  const listContent = document.querySelector('.list-content');
  const type = listContent.getAttribute('data-type');
  const api = '/api/';
  const backendDeleteApi = `/api/delete-content/${type}`;
  const authToken = localStorage.getItem('auth_token');
  let title;
  let url;

  if (type == 'local') {
    title = 'Contenido Local';
    url = 'add-content.html';
  }
  else if (type == 'external') {
    title = 'Contenido Externo';
    url = 'add-external-content.html';
  } else {
    title = 'Streams';
    url = 'add-stream.html';
  }

  // Cargar los datos al iniciar
  loadContentList();

  // Función para cargar y mostrar los datos
  async function loadContentList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
					<div class="card shadow-sm">
                      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                          <h2 class="h5 mb-0"><i class="fas fa-film me-2"></i>Lista de ${title}</h2>
                          <a href="/admin/${url}" class="add-button">Crear Contenido</a>
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
                                    <th>Género</th>
                                    <th>Tipo</th>
                                    <th>PPV</th>
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
      listContent.innerHTML = tableHTML;

      // Iniciando Datatable con Server-Side Processing
      const table = $('.datatable').DataTable({
        responsive: true,
        scrollX: true,
        scrollY: true,
        processing: true,
        serverSide: true,
        ajax: {
          url: api + `content/${type}/datatable`,
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
              return `<img src="${data}" class="datatable-img">`;
            },
          },
          { data: 'gender', name: 'gender' },
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
              else if (data == 'stream') return 'Stream';
            },
          },
          {
            data: 'pay_per_view',
            name: 'pay_per_view',
            render: function (data) {
              if (data == 0) return 'No';
              else return 'Sí';
            },
          },
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
      listContent.innerHTML = `
                    <div class="alert alert-danger">
                        Error al cargar la lista de Contenido: ${error.message}
                    </div>
                  `;
    }
  }
}

listContent();
