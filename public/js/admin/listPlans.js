import { deleteForm } from "../modules/deleteForm.js";
import { setUpMenuActions } from '../modules/setUpMenuActions.js';
import { storageData } from '../modules/storageData.js';


async function listPlans() {
    const listContent = document.getElementById('list-plans');
    const backendAPI = 'https://pruebastv.kmc.es/api/plans';
      const backendURL = 'https://pruebastv.kmc.es';
      const authToken = localStorage.getItem('auth_token');
      const backendDeleteApi = 'https://pruebastv.kmc.es/api/delete-plan';
		
    // Cargar los datos al iniciar
    loadPlansList();

    // Función para cargar y mostrar los datos
    async function loadPlansList() {
      try {
        const response = await fetch(backendAPI);

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        }

        const plans = data.plans;

        // Generar HTML de la tabla
          let tableHTML = `
		  			<div class="add-button-container">
                    	<h1><i class="fa-solid fa-euro-sign"></i> Lista de Planes</h1>
						<a href="/admin/add-plan.html" class="add-button add-plan">Añadir Plan</a>
					</div>
                    <div id="delete-plan-success-message" class="success-message" style="margin-bottom: 20px;">
                      ¡Plan eliminado con éxito!
                    </div>    
                    <div class="table-responsive">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    <th>Max Dispositivos</th>
                                    <th>Max Streams</th>
                                    <th>Anuncios</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

        plans.forEach((plan) => {
          let ads;

          if (plan.ads == 1) {
            ads = 'Sí';
          } else {
            ads = 'No';
            }
            
        tableHTML += ` 
                    <tr>
                        <td>${plan.id}</td>
                        <td>${plan.name}</td>
                        <td>${plan.price}</td>
                        <td>${plan.max_devices}</td>
                        <td>${plan.max_streams}</td>
                        <td>${ads}</td>
                        <td>
                            <div class="actions-container">
                                <button class="actions-button plans-button">Acciones</button>
                                <div class="actions-menu">
                                    <a href="/admin/edit-plan.html" class="action-item edit-button plan-action" data-id="${
                                        plan.id
                                    }">Editar</a>
                                    <form class="plans-delete-form" data-id="${
                                        plan.id
                                    }">
                                    <input type="hidden" name="plan_id" value="${
                                        plan.id
                                    }">
                                    <button class="action-item content-action delete-btn" type="submit">Eliminar</button>
                                    </form>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
          }
        );

        tableHTML += `
                            </tbody>
                        </table>
                    </div>
                `;

        // Insertar la tabla en el DOM
        listContent.innerHTML = tableHTML;

      const links = document.querySelectorAll('.action-item');
      links.forEach((link) => {
        link.addEventListener('click', storageData);
      });

      // Configurar los menús de acciones
      setUpMenuActions();

        const message = document.getElementById('delete-plan-success-message');
        deleteForm(authToken, '.plans-delete-form', backendDeleteApi, message);
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
