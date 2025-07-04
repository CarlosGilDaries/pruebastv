import { deleteForm } from '../modules/deleteForm.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';

async function listPlans() {
  const listContent = document.getElementById('list-plans');
  const api = '/api/';
  const backendURL = '/';
  const authToken = localStorage.getItem('auth_token');
  const backendDeleteApi = '/api/delete-plan';

  // Cargar los datos al iniciar
  loadPlansList();

  // Función para cargar y mostrar los datos
  async function loadPlansList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
		  			<div class="add-button-container">
                    	<h1><i class="fa-solid fa-euro-sign"></i> Lista de Planes</h1>
						<a href="/admin/add-plan.html" class="add-button add-plan">Crear Plan</a>
					</div>
                    <div id="delete-plan-success-message" class="success-message" style="margin-bottom: 20px;">
                      ¡Plan eliminado con éxito!
                    </div>    
                    <div class="table-responsive">
                        <table class="content-table display datatable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Precio Trimestral</th>
                                    <th>Precio Anual</th>
                                    <th>Max Dispositivos</th>
                                    <th>Max Streams</th>
                                    <th>Anuncios</th>
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
          url: api + 'plans/datatable',
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
          { data: 'name', name: 'name' },
          { data: 'trimestral_price', name: 'trimestral_price' },
          { data: 'anual_price', name: 'anual_price' },
          { data: 'max_devices', name: 'max_devices' },
          { data: 'max_streams', name: 'max_streams' },
          {
            data: 'ads',
            name: 'ads',
            render: function (data) {
              if (data == 1) return 'Sí';
              else return 'No';
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
            'delete-plan-success-message'
          );
          deleteForm(
            authToken,
            '.plans-delete-form',
            backendDeleteApi,
            message
          );
        },
      });
    } catch (error) {
      console.error('Error al cargar la lista de planes:', error);
      listContent.innerHTML = `
                    <div class="error-message">
                        Error al cargar la lista de planes: ${error.message}
                    </div>
                `;
    }
  }
}

listPlans();
