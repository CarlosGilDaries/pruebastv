export function storageData() {
  const dataSlug = this.getAttribute('data-slug');
  const dataId = this.getAttribute('data-id');
  const dataTitle = this.getAttribute('data-title');
  const serieId = this.getAttribute('data-serie-id');
  const serieSlug = this.getAttribute('data-serie-slug');
  const type = this.getAttribute('data-type');

  if (dataSlug) localStorage.setItem('slug', dataSlug);
  if (dataId) localStorage.setItem('id', dataId);
  if (dataTitle) localStorage.setItem('title', dataTitle);
  if (serieId) localStorage.setItem('serie-id', serieId);
  if (serieSlug) localStorage.setItem('serie-slug', serieSlug);
  if (type) localStorage.setItem('type', type);
}
