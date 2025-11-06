/*
 * Javascript to show and hide cookie banner using localstorage
 */

/**
 * @description Shows the cookie banner
 */
function showCookieBanner() {
  let cookieBanner = document.getElementById('cb-cookie-banner');
  let overlay = document.getElementById('cb-cookie-overlay');
  cookieBanner.style.display = 'block';
  overlay.style.display = 'block';
}

/**
 * @description Hides the Cookie banner and saves the value to localstorage
 */
function hideCookieBanner() {
  const analyticsAccepted = document.getElementById('analytics-cookie').checked;
  localStorage.setItem('cb_isCookieAccepted', 'yes');
  localStorage.setItem(
    'cb_analyticsAccepted',
    analyticsAccepted ? 'yes' : 'no'
  );

  let cookieBanner = document.getElementById('cb-cookie-banner');
  let overlay = document.getElementById('cb-cookie-overlay');
  cookieBanner.style.display = 'none';
  overlay.style.display = 'none';

  console.log('Preferencias guardadas:');
  console.log('- Cookies esenciales: Aceptadas (obligatorias)');
  console.log(
    '- Google Analytics: ' + (analyticsAccepted ? 'Aceptadas' : 'Rechazadas')
  );

  // 👉 Cargar GA solo si se aceptaron
  if (analyticsAccepted) {
    loadGoogleAnalytics();
  }
}

/**
 * @description Accepts all cookies
 */
function acceptAllCookies() {
  document.getElementById('analytics-cookie').checked = true;
  hideCookieBanner();
}

/**
 * @description Checks the localstorage and shows Cookie banner based on it.
 */
function initializeCookieBanner() {
  let isCookieAccepted = localStorage.getItem('cb_isCookieAccepted');
  if (isCookieAccepted === null) {
    localStorage.setItem('cb_isCookieAccepted', 'no');
    showCookieBanner();
  }
  if (isCookieAccepted === 'no' && document.body.id != 'cookies_policy') {
    showCookieBanner();
  } else {
    // Si ya se aceptaron cookies, cargar las preferencias guardadas
    const analyticsAccepted = localStorage.getItem('cb_analyticsAccepted');
    if (analyticsAccepted) {
      document.getElementById('analytics-cookie').checked =
        analyticsAccepted === 'yes';

      if (analyticsAccepted === 'yes') {
        loadGoogleAnalytics();
      }
    }
  }
}

/**
 * @description Loads the Google Analitycs script.
 */
function loadGoogleAnalytics() {
  if (document.getElementById('ga-script')) {
    return; // Evita cargarlo dos veces
  }

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-ABCDE12345';
  script1.id = 'ga-script'; // para identificarlo
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-ABCDE12345');
  `;
  document.head.appendChild(script2);

  console.log('Google Analytics cargado');
}


// Assigning values to window object
window.onload = initializeCookieBanner();
window.cb_hideCookieBanner = hideCookieBanner;
window.cb_acceptAllCookies = acceptAllCookies;
