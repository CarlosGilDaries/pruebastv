export function setupSlugGenerator(titleId, aliasId) {
  const titleInput = document.getElementById(titleId);
  const aliasInput = document.getElementById(aliasId);

  if (!titleInput || !aliasInput) return;

  titleInput.addEventListener('input', () => {
    const slug =
      '/' +
      titleInput.value
        .toLowerCase() // minúsculas
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // elimina acentos
        .replace(/[^a-z0-9\s-]/g, '') // elimina caracteres no válidos
        .trim() // quita espacios al inicio/fin
        .replace(/\s+/g, '-') // reemplaza espacios por guiones
        .replace(/-+/g, '-'); // evita guiones duplicados

    aliasInput.value = slug;
  });
}
