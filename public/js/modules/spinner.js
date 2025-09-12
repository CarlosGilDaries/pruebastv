// Funciones actualizadas para transiciones suaves
export function hideSpinner() {
  const spinner = document.getElementById('loading-spinner');
  const mainContent = document.getElementById('main-content');

  if (spinner) {
    // Agregar clase para ocultar con transición
    spinner.classList.add('hidden');
  }

  if (mainContent) {
    // Mostrar contenido con transición
    mainContent.classList.add('visible');
    
    // Opcional: eliminar la clase después de la transición
    setTimeout(() => {
      mainContent.classList.remove('main-content');
    }, 500);
  }
}

export function showSpinner() {
  const spinner = document.getElementById('loading-spinner');
  const mainContent = document.getElementById('main-content');

  if (spinner) {
    // Quitar clase de ocultar
    spinner.classList.remove('hidden');
  }

  if (mainContent) {
    // Ocultar contenido
    mainContent.classList.remove('visible');
    mainContent.classList.add('main-content');
  }
}

