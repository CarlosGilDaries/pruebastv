// translations.js
document.addEventListener('DOMContentLoaded', function () {
  const languageSelector = document.getElementById('languageSelector');
  let currentLanguage = 'es'; // Idioma por defecto
  let translations = {}; // Almacenará todas las traducciones
  titleId = document.body.id;

  // Cargar idiomas disponibles
  async function loadLanguages() {
    try {
      const response = await fetch('/api/languages');
      if (!response.ok) {
        throw new Error('Error al cargar los idiomas');
      }

      const data = await response.json();

      if (data.success && data.languages && data.languages.length > 0) {
        // Limpiar selector
        languageSelector.innerHTML = '';

        // Agregar idiomas disponibles
        data.languages.forEach((language) => {
          if (language.is_active === 1) {
            const option = document.createElement('option');
            option.value = language.code;
            option.textContent = language.name;
            languageSelector.appendChild(option);

            // Guardar las traducciones de este idioma
            translations[language.code] = {};
            language.translations.forEach((trans) => {
              translations[language.code][trans.key] = trans.value;
            });
          }
        });

        // Cargar traducciones del español (si no está en la lista)
        if (!translations['es']) {
          await loadSpanishTranslations();
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Cargar traducciones del español (idioma por defecto)
  async function loadSpanishTranslations() {
    try {
      const response = await fetch('/api/language/es');
      if (!response.ok) {
        throw new Error('Error al cargar las traducciones en español');
      }

      const data = await response.json();

      if (data.success && data.language && data.language.translations) {
        translations['es'] = {};
        data.language.translations.forEach((trans) => {
          translations['es'][trans.key] = trans.value;
        });

        // Aplicar traducciones por defecto
        applyTranslations('es');
      }
    } catch (error) {
      console.error('Error cargando español:', error);
    }
  }

  // Aplicar las traducciones al documento
  function applyTranslations(langCode) {
    const langTranslations = translations[langCode];
    if (!langTranslations) return;

    // Actualizar elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (langTranslations[key]) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = langTranslations[key];
        } else {
          element.textContent = langTranslations[key];
        }
      }
    });

    // Actualizar título de la página
    const titleTranslation = langTranslations[`${titleId}_title`];
    console.log(`${titleId}_title`);
    document.title = titleTranslation;
  }

  // Manejar cambio de idioma
  languageSelector.addEventListener('change', async function () {
    const selectedLang = this.value;

    if (selectedLang === 'es') {
      // Si es español, aplicar las traducciones que ya tenemos
      applyTranslations('es');
    } else if (translations[selectedLang]) {
      // Si tenemos las traducciones de este idioma, aplicarlas
      applyTranslations(selectedLang);
    } else {
      // Si no tenemos las traducciones, cargarlas
      try {
        const response = await fetch(`/api/language/${selectedLang}`);
        if (!response.ok) {
          throw new Error('Error al cargar las traducciones');
        }

        const data = await response.json();

        if (data.success && data.language && data.language.translations) {
          // Guardar las traducciones
          translations[selectedLang] = {};
          data.language.translations.forEach((trans) => {
            translations[selectedLang][trans.key] = trans.value;
          });

          // Aplicar las traducciones
          applyTranslations(selectedLang);
        }
      } catch (error) {
        console.error('Error cambiando idioma:', error);
        // Volver al español si hay error
        this.value = 'es';
        applyTranslations('es');
      }
    }

    currentLanguage = selectedLang;
  });

  // Inicializar
  loadLanguages();
});
