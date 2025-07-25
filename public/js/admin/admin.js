import { logOut } from '../modules/logOut.js';
import { adminCheck } from '../modules/adminCheck.js';

const email = localStorage.getItem('current_user_email');
const device_id = localStorage.getItem('device_id_' + email);
const token = localStorage.getItem('auth_token');
const backendAPI = '/api/';
const logOutButton = document.getElementById('logout-button');
const container = document.querySelector('.admin-panel');
const links = document.querySelectorAll('.admin-menu .nav-link');

const permissionToContentMap = {
  contenido_local: 'list-local-content',
  contenido_externo: 'list-external-content',
  streams: 'list-streams',
  anuncios: 'list-ads',
  planes: 'list-plans',
  generos: 'list-genders',
  categorias: 'list-categories',
  llamadas_a_accion: 'list-actions',
  usuarios: 'list-users',
  pedidos: 'list-orders',
  facturas: 'list-bills',
  roles: 'list-roles',
  etiquetas: 'list-tags',
  ajustes_web: 'web-config',
  footer_items: 'list-footer-items',
  aviso_legal: 'list-legal-notices',
  politica_privacidad: 'list-privacy-politics'
};

if (token == null) {
	window.location.href = '/login';
}

if (device_id == null) {
	logOut(token);
}

filterSidebarByPermissions();

async function filterSidebarByPermissions() {
  try {
    const res = await fetch('/api/user', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include', // necesario si usas cookies de sesión
    });

    const data = await res.json();
    const userPermissions = data.data.user.role.permissions.map((p) => p.name);

    // Oculta los <li> que no correspondan a los permisos del usuario
    Object.entries(permissionToContentMap).forEach(
      ([permission, contentKey]) => {
        if (!userPermissions.includes(permission)) {
          const li = document.querySelector(`li[data-content="${contentKey}"]`);
          const parentLink = li?.closest('a');
          if (parentLink) {
            parentLink.style.display = 'none';
          } else if (li) {
            li.style.display = 'none';
          }
        }
      }
    );

    // Mostrar "Estadísticas" solo si el usuario tiene todos los permisos
    const allRequiredPermissions = Object.keys(permissionToContentMap);
    const hasAllPermissions = allRequiredPermissions.every((p) =>
      userPermissions.includes(p)
    );

    const statsLi = document.querySelector('li[data-content="admin-panel"]');
    const statsLink = statsLi?.closest('a');

    if (!hasAllPermissions) {
      if (statsLink) {
        statsLink.style.display = 'none';
      } else if (statsLi) {
        statsLi.style.display = 'none';
      }
    }
    
  } catch (error) {
    console.error('Error al cargar permisos del usuario:', error);
  }
}

adminCheck(token);

logOutButton.addEventListener('click', function() {
	logOut(token);
});

document.addEventListener('DOMContentLoaded', function () {
  links.forEach((link) => {
    const li = link.closest('li');
    if (container && li && li.getAttribute('data-content') == container.id) {
      link.classList.add('active');
    }
  });
});

