import { deleteForm } from '../modules/deleteForm.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';

async function listUsers() {
  const listUsers = document.getElementById('list-users');
  const api = '/api/';
  const backendDeleteApi = '/api/delete-user';
  const backendURL = '/';
  const authToken = localStorage.getItem('auth_token');

  // Cargar los datos al iniciar
  loadUsersList();

  // Función para cargar y mostrar los datos
  async function loadUsersList() {
    try {
      // Generar HTML de la tabla
      let tableHTML = `
                    <div class="card shadow-sm">
                      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                          <h2 class="h5 mb-0"><i class="fas fa-user me-2"></i> Lista de Usuarios</h2>
                          <a href="/admin/add-user.html" class="add-button">Crear Usuario</a>
                          </div>
                      <div class="card-body">
                          <div id="delete-user-success-message" class="alert alert-success d-none mb-3"></div>
                          
                          <div class="table-responsive">
                              <table class="table table-striped table-hover table-bordered display datatable" style="width:100%">
                                  <thead class="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre Completo</th>
                                    <th>Email</th>
                                    <th>DNI</th>
                                    <th>Edad</th>
                                    <th>Género</th>
                                    <th>Tipo</th>
                                    <th>Rol</th>
                                    <th>Plan</th>
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
      listUsers.innerHTML = tableHTML;

      // Iniciando Datatable con Server-Side Processing
      const table = $('.datatable').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
          url: '/api/users/datatable',
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
          { data: 'full_name', name: 'full_name' },
          { data: 'email', name: 'email' },
          { data: 'dni', name: 'dni' },
          {
            data: 'age',
            name: 'age',
            render: function (data) {
              return calculateAge(data);
            },
          },
          {
            data: 'gender',
            name: 'gender',
          },
          { data: 'rol', name: 'rol' },
          { data: 'role', name: 'role' },
          { data: 'plan', name: 'plan' },
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
          const links = document.querySelectorAll('.action-item');
          links.forEach((link) => {
            link.addEventListener('click', storageData);
          });

          // Configurar los menús de acciones
          setUpMenuActions();

          const message = document.getElementById(
            'delete-user-success-message'
          );
          deleteForm(authToken, '.user-delete-form', backendDeleteApi, message);
        },
      });
    } catch (error) {
      console.error('Error al cargar la lista de usuarios:', error);
      listContent.innerHTML = `
                    <div class="alert alert-danger">
                        Error al cargar la lista de Acciones: ${error.message}
                    </div>
                  `;
    }
  }
}

listUsers();

function calculateAge(birthYear) {
  const today = new Date();

  let age = today.getFullYear() - birthYear;

  return age;
}
