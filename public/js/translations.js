// Configuración de traducciones
let currentLocale = 'es';
let translations = {};
let pageId = document.body.id || 'login'; // Asigna un ID a cada body o usa la ruta

// Función para aplicar traducciones
function applyTranslations() {
  // Traducir elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = __(key);
  });

  // Traducir título de página
  updatePageTitle();
}

// Función para actualizar título de página
function updatePageTitle() {
  const pageTitleKey = `page_titles.${pageId}`;
  const defaultTitle =
    document.querySelector('h1, h2, h3')?.textContent || __('login');
  document.title = __(pageTitleKey) || defaultTitle;
}

// Función para determinar el ID de página
function getPageId() {
  const path = window.location.pathname;
  if (path === '/login.html' || path === '/') return 'login';
  if (path === '/plans.html') return 'plans';
  if (path === '/contact.html') return 'contact';
  // Añade más rutas según necesites
  return path.split('/').pop().replace('.html', '') || 'home';
}

// Inicialización mejorada
function initializeTranslations() {
  pageId = getPageId();
  const savedLocale = localStorage.getItem('userLocale');
  const browserLocale = navigator.language.substring(0, 2);
  const defaultLocale = ['es', 'en', 'va'].includes(browserLocale)
    ? browserLocale
    : 'es';

  loadTranslations(savedLocale || defaultLocale);
}

// Función para cargar traducciones
async function loadTranslations(locale) {
  try {
    const response = await fetch(`/api/translations/${locale}`);
    if (!response.ok) throw new Error('Failed to load translations');

    translations = await response.json();
    currentLocale = locale;
    applyTranslations();

    // Guardar preferencia
    localStorage.setItem('userLocale', locale);

    // Actualizar selector
    document.getElementById('languageSelector').value = locale;

    // Cambiar atributo lang del html
    document.documentElement.lang = locale;
  } catch (error) {
    console.error('Error loading translations:', error);
  }
}

// Función para obtener traducción
function __(key, group = 'messages') {
  return translations[group]?.[key] || key;
}

// Aplicar traducciones a la interfaz
function applyTranslations() {
  // Elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = __(key);
  });

  // Título de la página
  document.title = __('login');
}

// Selector de idioma
document.getElementById('languageSelector').addEventListener('change', (e) => {
  loadTranslations(e.target.value);
});


// Inicializar
document.addEventListener('DOMContentLoaded', initializeTranslations);
