export function aceptedCookies() {
    let isCookieAccepted = localStorage.getItem('cb_isCookieAccepted');
    if (isCookieAccepted != 'yes') {
        window.location.href = "/";
    }
}