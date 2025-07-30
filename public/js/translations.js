// translations.js
let currentLanguage = localStorage.getItem('userLocale') || 'es';
let translations = {};

// Exporta la función applyTranslations
export function applyTranslations(langCode) {
  const langTranslations = translations[langCode];
  if (!langTranslations) return;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (langTranslations[key]) {
      element.innerHTML = langTranslations[key];
    }
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (langTranslations[key]) {
      element.placeholder = langTranslations[key];
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const languageSelector = document.getElementById('languageSelector');
  const titleId = document.body.id;

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
            if (language.code === currentLanguage) {
              option.selected = true;
            }
            languageSelector.appendChild(option);

            // Guardar las traducciones de este idioma
            translations[language.code] = {};
            language.translations.forEach((trans) => {
              translations[language.code][trans.key] = trans.value;
            });
          }
        });

        // Si no se seleccionó ningún idioma (porque no estaba activo), usar español
        if (!languageSelector.value && currentLanguage !== 'es') {
          currentLanguage = 'es';
          localStorage.setItem('userLocale', 'es');
        }

        // Cargar traducciones del español (si no está en la lista) o aplicar el idioma guardado
        if (!translations['es']) {
          await loadSpanishTranslations();
        } else if (translations[currentLanguage]) {
          applyTranslations(currentLanguage);
        } else {
          await loadLanguage(currentLanguage);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Cargar un idioma específico desde la API
  async function loadLanguage(langCode) {
    try {
      const response = await fetch(`/api/language/${langCode}`);
      if (!response.ok) {
        throw new Error('Error al cargar las traducciones');
      }

      const data = await response.json();

      if (data.success && data.language && data.language.translations) {
        translations[langCode] = {};
        data.language.translations.forEach((trans) => {
          translations[langCode][trans.key] = trans.value;
        });

        applyTranslations(langCode);
      }
    } catch (error) {
      console.error(`Error cargando idioma ${langCode}:`, error);
      // Si falla, cargar español por defecto
      if (langCode !== 'es') {
        currentLanguage = 'es';
        localStorage.setItem('userLocale', 'es');
        if (!translations['es']) {
          await loadSpanishTranslations();
        } else {
          applyTranslations('es');
        }
      }
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
  /*function applyTranslations(langCode) {
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
    if (langTranslations[`${titleId}_title`]) {
      document.title = langTranslations[`${titleId}_title`];
    } else if (langTranslations[titleId]) {
      document.title = langTranslations[titleId];
    }
  }*/

  // Manejar cambio de idioma
  languageSelector.addEventListener('change', async function () {
    const selectedLang = this.value;
    await setLanguage(selectedLang);
  });

  // Función para cambiar idioma
  async function setLanguage(langCode) {
    if (langCode === currentLanguage) return;

    if (langCode === 'es') {
      // Si es español, aplicar las traducciones que ya tenemos
      localStorage.setItem('userLocale', 'es');
      if (translations['es']) {
        applyTranslations('es');
        currentLanguage = 'es';
      } else {
        await loadSpanishTranslations();
      }
    } else if (translations[langCode]) {
      // Si tenemos las traducciones de este idioma, aplicarlas
      localStorage.setItem('userLocale', langCode);
      applyTranslations(langCode);
      currentLanguage = langCode;
    } else {
      // Si no tenemos las traducciones, cargarlas
      await loadLanguage(langCode);
    }
  }

  // Inicializar
  loadLanguages();
});
