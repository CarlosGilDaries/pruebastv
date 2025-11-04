const footer = document.querySelector('footer');

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
