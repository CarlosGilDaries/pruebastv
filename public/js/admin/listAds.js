import { formatDuration } from '../modules/formatDuration.js';
import { deleteForm } from '../modules/deleteForm.js';
import { storageData } from '../modules/storageData.js';
import { setUpMenuActions } from '../modules/setUpMenuActions.js';

  async function listAds() {
    const listContent = document.getElementById('list-ads');
    const backendAPI = 'https://pruebastv.kmc.es/api/ads-list';
    const backendDeleteApi = 'https://pruebastv.kmc.es/api/delete-ads';
    const backendURL = 'https://pruebastv.kmc.es/';
    const authToken = localStorage.getItem('auth_token');
	  
	// Cargar los datos al iniciar
    loadAdsList();
	  	  
    // Función para cargar y mostrar los datos
    async function loadAdsList() {
      try {
        const response = await fetch(backendAPI, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        }

        const ads = data.data;

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
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Marca</th>
                                    <th>Tipo</th>
                                    <th>Duración</th>
                                    <th>Imagen</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

        ads.forEach((ad) => {
          let type;
          let cover;
          if (ad.type == 'application/vnd.apple.mpegurl') {
            type = 'HLS';
          } else {
            type = ad.type;
          }
          if (ad.cover == null) {
            tableHTML += ` 
                        <tr>
                            <td>${ad.id}</td>
                            <td>${ad.title}</td>
                            <td>${ad.brand}</td>
                            <td>${type}</td>
                            <td>${formatDuration(ad.duration)}</td>
                            <td>N/A</td>
                            <td>
                                <div class="actions-container">
                                    <button class="actions-button ads-button">Acciones</button>
                                    <div class="actions-menu">
                                        <a href="/player/ad/${
                                          ad.slug
                                        }" class="action-item">Ver</a>
										<a href="/admin/edit-ad.html" class="action-item edit-button ad-action" data-id="${ad.id}" data-slug="${
                                          ad.slug
                                        }">Editar</a>
                                        <form class="ads-delete-form" data-id="${
                                          ad.id
                                        }">
                                        <input type="hidden" name="content_id" value="${
                                          ad.id
                                        }">
                                        <button class="action-item content-action delete-btn" type="submit">Eliminar</button>
                                        </form>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
          } else {
            tableHTML += `
                        <tr>
                            <td>${ad.id}</td>
                            <td>${ad.title}</td>
                            <td>${ad.brand}</td>
                            <td>${type}</td>
                            <td>${formatDuration(ad.duration)}</td>
                            <td><img src="${cover}" alt="${
              ad.title
            }" class="cover-image"></td>
                            
                            <td>
                                <div class="actions-container">
                                    <button class="actions-button">Acciones</button>
                                    <div class="actions-menu">
                                        <a href="/player/ad/${
                                          ad.slug
                                        }" class="action-item">Ver</a>
                                        <a href="/admin/edit-ad.html" class="action-item edit-button ad-action" data-id="${ad.id}" data-slug="${
                                          ad.slug
                                        }">Editar</a>
                                        <form class="ads-delete-form" data-id="${
                                          ad.id
                                        }">
                                        <input type="hidden" name="content_id" value="${
                                          ad.id
                                        }">
                                        <button class="action-item content-action delete-btn" data-movie-id="${
                                          ad.id
                                        }" type="submit">Eliminar</button>
                                        </form>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
          }
        });

        tableHTML += `
                            </tbody>
                        </table>
                    </div>
                `;

        // Insertar la tabla en el DOM
        listContent.innerHTML = tableHTML;
		  
		const links = document.querySelectorAll('.action-item');
			links.forEach(link => {
				link.addEventListener('click', storageData);
			});

        // Configurar los menús de acciones
        setUpMenuActions();

        const message = document.getElementById('delete-ad-success-message');
        deleteForm(authToken, '.ads-delete-form', backendDeleteApi, message);
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

