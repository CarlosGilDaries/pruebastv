export function buildSeoFormData(key) {
  const seoFormData = new FormData();
  let seo = false;

  const fields = [
    { id: 'seo-title', name: 'title' },
    { id: 'seo-keywords', name: 'keywords' },
    { id: 'seo-robots', name: 'robots' },
    { id: 'seo-alias', name: 'alias' },
    { id: 'seo-url', name: 'url' },
    { id: 'seo-description', name: 'description' },
  ];

  fields.forEach((field) => {
    const element = document.getElementById(field.id);
    if (element && element.value.trim() !== '') {
      seoFormData.append(field.name, element.value.trim());
      seo = true;
    }
  });

  if (seo) {
    seoFormData.append('key', key);
  }

  return { seoFormData, seo };
}
