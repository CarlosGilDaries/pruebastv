export function generateAdminSidebar() {
  if (document.getElementById('adminSidebar')) {
    document.getElementById('adminSidebar').innerHTML = `
            <div class="offcanvas-body">
                <ul class="admin-menu nav flex-column">
                    <li class="nav-item" data-content="admin-panel">
                    <a class="nav-link" href="/admin/admin-panel.html">
                        <i class="fa-solid fa-square-poll-vertical me-2"></i>
                        <span>Estadísticas</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-local-content">
                    <a class="nav-link" href="/admin/list-content.html">
                        <i class="fas fa-film me-2"></i>
                        <span>Contenido Local</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-external-content">
                    <a class="nav-link" href="/admin/list-external-content.html">
                        <i class="fa-solid fa-arrow-up-right-from-square me-2"></i>
                        <span>Contenido Externo</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-streams">
                    <a class="nav-link" href="/admin/list-streams.html">
                        <i class="fa-solid fa-tower-broadcast me-2"></i>
                        <span>Streams</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-series">
                    <a class="nav-link" href="/admin/list-series.html">
                        <i class="fa-solid fa-atom me-2"></i>
                        <span>Series</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-ads">
                    <a class="nav-link" href="/admin/list-ads.html">
                        <i class="fas fa-ad me-2"></i>
                        <span>Anuncios</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-plans">
                    <a class="nav-link" href="/admin/list-plans.html">
                        <i class="fa-solid fa-euro-sign me-2"></i>
                        <span>Planes</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-genders">
                    <a class="nav-link" href="/admin/list-genders.html">
                        <i class="fa-solid fa-rocket me-2"></i>
                        <span>Géneros</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-categories">
                    <a class="nav-link" href="/admin/list-categories.html">
                        <i class="fa-solid fa-layer-group me-2"></i>
                        <span>Categorías</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-tags">
                    <a class="nav-link" href="/admin/list-tags.html">
                        <i class="fa-solid fa-tag me-2"></i>
                        <span>Etiquetas</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-actions">
                    <a class="nav-link" href="/admin/list-actions.html">
                        <i class="fa-solid fa-location-crosshairs me-2"></i>
                        <span>LLamadas a Acción</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-users">
                    <a class="nav-link" href="/admin/list-users.html">
                        <i class="fas fa-user me-2"></i>
                        <span>Usuarios</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-orders">
                    <a class="nav-link" href="/admin/list-orders.html">
                        <i class="fa-solid fa-file-invoice-dollar me-2"></i>
                        <span>Pedidos</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-bills">
                    <a class="nav-link" href="/admin/list-bills.html">
                        <i class="fa-solid fa-receipt me-2"></i>
                        <span>Facturas</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-languages">
                    <a class="nav-link" href="/admin/list-languages.html">
                        <i class="fa-solid fa-language me-2"></i>
                        <span>Idiomas</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="web-config">
                    <a class="nav-link" href="/admin/web-config.html">
                        <i class="fa-solid fa-globe me-2"></i>
                        <span>Configuración Web</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="seo-config">
                    <a class="nav-link" href="/admin/seo-config.html">
                        <i class="fa-solid fa-magnifying-glass me-2"></i>
                        <span>Configuración Seo</span>
                    </a>
                    <li class="nav-item" data-content="mail-config">
                    <a class="nav-link" href="/admin/mail-config.html">
                        <i class="fa-solid fa-envelope me-2"></i>
                        <span>Configuración Mail</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="scripts-config">
                    <a class="nav-link" href="/admin/scripts.html">
                        <i class="fa-solid fa-scroll me-2"></i>
                        <span>Scripts</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-legal-notices">
                    <a class="nav-link" href="/admin/list-legal-notices.html">
                        <i class="fa-solid fa-gavel me-2"></i>
                        <span>Aviso Legal</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-privacy-politics">
                    <a class="nav-link" href="/admin/list-privacy-politics.html">
                        <i class="fa-solid fa-lock me-2"></i>
                        <span>Política de Privacidad</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-payment-politics">
                    <a class="nav-link" href="/admin/list-payment-politics.html">
                        <i class="fa-solid fa-money-bill me-2"></i>
                        <span>Política de Pagos</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-cookies">
                    <a class="nav-link" href="/admin/list-cookies.html">
                        <i class="fa-solid fa-cookie me-2"></i>
                        <span>Cookies</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-footer-items">
                    <a class="nav-link" href="/admin/list-footer-items.html">
                        <i class="fa-solid fa-shoe-prints me-2"></i>
                        <span>Items Footer</span>
                    </a>
                    </li>
                    <li class="nav-item" data-content="list-roles">
                    <a class="nav-link" href="/admin/list-roles.html">
                        <i class="fa-solid fa-users me-2"></i>
                        <span>Roles</span>
                    </a>
                    </li>
                </ul>
            </div>
        `;
    }

    const container = document.querySelector('.admin-panel');
    const links = document.querySelectorAll('.admin-menu .nav-link');

    links.forEach((link) => {
    const li = link.closest('li');
    if (
        container &&
        li &&
        li.getAttribute('data-content') == container.id
    ) {
        link.classList.add('active');
    }
    });
}
