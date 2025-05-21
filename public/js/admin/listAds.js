import { formatDuration } from '../modules/formatDuration.js';
import { deleteForm } from '../modules/deleteForm.js';
import { storageData } from '../modules/storageData.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';

async function listAds() {
  const listContent = document.getElementById('list-ads');
  const api = 'https://pruebastv.kmc.es/api/';
  const backendDeleteApi = 'https://pruebastv.kmc.es/api/delete-ads';
  const backendURL = 'https://pruebastv.kmc.es/';
  const authToken = localStorage.getItem('auth_token');

  // Cargar los datos al iniciar
  loadAdsList();

  // Función para cargar y mostrar los datos
  async function loadAdsList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
					<div class="add-button-container">
						<h1><i class="fas fa-ad"></i> Lista de Anuncios</h1>
						<a href="/admin/add-ad.html" class="add-button add-ad">Crear Anuncio</a>
					</div>
                    <div id="delete-ad-success-message" class="success-message" style="margin-bottom: 20px;">
                      ¡Anuncio eliminado con éxito!
                    </div>    
                    <div class="table-responsive">
                        <table class="content-table display datatable">
                            <thead>
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
                `;

      // Insertar la tabla en el DOM
      listContent.innerHTML = tableHTML;

      // Iniciando Datatable con Server-Side Processing
      const table = $('.datatable').DataTable({
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

          const message = document.getElementById('delete-ad-success-message');
          deleteForm(authToken, '.ads-delete-form', backendDeleteApi, message);
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

listAds();
