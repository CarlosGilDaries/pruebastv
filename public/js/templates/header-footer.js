const header = document.querySelector('header');
const footer = document.querySelector('footer');

header.innerHTML = `<nav class="navbar navbar-expand-lg menu container-fluid navbar-dark">
            <div class="container-fluid">
                <!-- Logo -->
                <a class="navbar-brand logo" href="/">
                    <img src="/file/logo.png" id="logo" alt="Pruebas TV logo">
                </a>

                <!-- Botón hamburguesa -->
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <!-- Contenido colapsable -->
                <div class="collapse navbar-collapse mt-3 mt-lg-0" id="mainNavbar">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0 left-nav">
                        <li class="nav-item left-nav-links">
                            <a class="nav-link" href="/" data-i18n="nav_home">Inicio</a>
                        </li>

                        <li class="nav-item dropdown left-nav-links">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" data-i18n="category_title">Categorías</a>
                            <ul class="dropdown-menu" id="categories"></ul>
                        </li>
                        <li class="nav-item dropdown left-nav-links">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" data-i18n="gender_title">Géneros</a>
                            <ul class="dropdown-menu" id="genders"></ul>
                        </li>
                            
                        <li class="nav-item left-nav-links">
                            <a id="plans-link" class="nav-link" href="/planes" data-i18n="plans_title">Planes</a>
                        </li>
                    </ul>

                    <ul class="navbar-nav ms-lg-auto right-nav">
                        <li class="nav-item dropdown user">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" id="user-link" data-i18n="nav_account">
                                Cuenta
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end" id="dropdown-user">
                                <li><a id="profile-link" class="dropdown-item" href="/account" data-i18n="nav_profile">Perfil</a></li>
                                <li><a id="favorites-link" class="dropdown-item" href="/favorites.html" data-i18n="nav_favorites">Favoritos</a></li>
                                <li><a id="seen-link" class="dropdown-item" href="/seen.html" data-i18n="nav_watched">Vistos</a></li>
                                <li><a id="paid-link" class="dropdown-item" href="/paid-resources.html" data-i18n="nav_paid_resources">Recursos Pagados</a></li>
                                <li><a id="order-link" class="dropdown-item" href="/order-history.html" data-i18n="nav_payment_history">Historial de pagos</a></li>
                                <li><a class="dropdown-item" id="logout" href="#" data-i18n="nav_logout">Cerrar sesión</a></li>
                            </ul>
                        </li>

                        <li class="nav-item d-flex align-items-center ms-2" id="language-container">
                            <select id="languageSelector" class="form-select form-select-sm bg-dark text-white border-secondary"></select>
                        </li>
                    </ul>
                </div>

                <!-- Filtro de búsqueda -->
                <div class="search-container d-flex align-items-center ms-auto">
                    <div class="search-icon me-2">
                        <img src="/images/search-icon.png" alt="Buscar" id="searchToggle">
                    </div>
                    <div class="search-box" id="searchBox">
                        <input type="text" id="searchInput" placeholder="Buscar contenido..." data-i18n-placeholder="search_placeholder">
                        <div class="search-results" id="searchResults"></div>
                    </div>
                </div>
            </div>
        </nav>`;

footer.innerHTML = `<div class="container-fluid py-4 px-3">
            <div class="row align-items-center text-center text-lg-start">
                <div class="col-12 col-lg-6 mb-4 mb-lg-0">
                    <div class="info d-flex flex-column flex-lg-row justify-content-center justify-content-lg-start align-items-center gap-5">
                        <a id="legal-notice-link" href="/legal-notice.html" data-i18n="legal_notice">Aviso Legal</a>
                        <a id="privacy-politic-link" href="/privacy-politic.html" data-i18n="privacy_policy">Política de Privacidad</a>
                        <a id="payment-politic-link" href="/payment-politic.html" data-i18n="payment_policy">Política de Pagos</a>
                        <a id="cookies-link" href="/cookies.html" data-i18n="cookies">Cookies</a>
                        <a id="contact-link" href="/contact.html" data-i18n="contact">Contacto</a>
                    </div>
                </div>

                <!-- Redes sociales -->
                <div class="col-12 col-lg-6">
                    <ul class="icons list-unstyled d-flex justify-content-center justify-content-lg-end gap-4 m-0">
                        <li><a id="instagram" href="https://www.instagram.com/"><img src="/images/instagram-53.png" alt="Instagram"></a></li>
                        <li><a id="facebook" href="https://www.facebook.com/"><img src="/images/facebook.png" alt="Facebook"></a></li>
                        <li><a id="twitter" href="https://www.twitter.com/"><img src="/images/twitterx--v2.png" alt="Twitter"></a></li>
                    </ul>
                </div>
            </div>

            <!-- Separador -->
            <div class="separation-line my-3"></div>

            <!-- Segunda fila: logos institucionales y copyright -->
            <div class="row align-items-center text-center text-lg-start">
                <!-- Logos -->
                <div class="col-12 col-lg-8 mb-3 mb-lg-0">
                    <div class="items-container d-flex flex-wrap justify-content-center justify-content-lg-start align-items-center gap-5"></div>
                </div>

                <!-- Copyright -->
                <div class="col-12 col-lg-4 text-lg-end">
                    <p id="copyright" class="mb-0">
                    <a href="https://www.kmcmobile.es/">KMCMobile</a> © 2025
                    </p>
                </div>
            </div>
        </div>`;

async function setUrls() {
  try {
    const plansLink = document.getElementById('plans-link');
    const profileLink = document.getElementById('profile-link');
    const favoritesLink = document.getElementById('favorites-link');
    const seenLink = document.getElementById('seen-link');
    const paidLink = document.getElementById('paid-link');
    const orderLink = document.getElementById('order-link');
    const legalLink = document.getElementById('legal-notice-link');
    const privacyLink = document.getElementById('privacy-politic-link');
    const paymentPoliticLink = document.getElementById('payment-politic-link');
    const cookiesLink = document.getElementById('cookies-link');
    const contactLink = document.getElementById('contact-link');

    const response = await fetch('/api/all-seo-settings');
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const data = await response.json();

    const seoSettings = data.settings || [];

    seoSettings.forEach((setting) => {
      switch (setting.key) {
        case 'plans':
          if (plansLink) plansLink.href = setting.url;
          break;
        case 'profile':
          if (profileLink) profileLink.href = setting.url;
          break;
        case 'favorites':
          if (favoritesLink) favoritesLink.href = setting.url;
          break;
        case 'seen':
          if (seenLink) seenLink.href = setting.url;
          break;
        case 'paid-resources':
          if (paidLink) paidLink.href = setting.url;
          break;
        case 'payment-history':
          if (orderLink) orderLink.href = setting.url;
          break;
        case 'legal-notice':
          if (legalLink) legalLink.href = setting.url;
          break;
        case 'privacy-policy':
          if (privacyLink) privacyLink.href = setting.url;
          break;
        case 'payment-policy':
          if (paymentPoliticLink) paymentPoliticLink.href = setting.url;
          break;
        case 'cookies':
          if (cookiesLink) cookiesLink.href = setting.url;
          break;
        case 'contact':
          if (contactLink) contactLink.href = setting.url;
          break;
      }
    });
  } catch (error) {
    console.error('Error al establecer las URLs SEO:', error);
  }
}

setUrls();