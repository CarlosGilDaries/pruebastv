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
  window.location.reload();
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
    }
  }
}

// Assigning values to window object
window.onload = initializeCookieBanner();
window.cb_hideCookieBanner = hideCookieBanner;
window.cb_acceptAllCookies = acceptAllCookies;
