export function setSeoSettings(seoSettings) {
  const head = document.head;

  if (seoSettings.title != null) {
    document.title = seoSettings.title;
  }

  if (seoSettings.canonical != null) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', seoSettings.canonical);
    head.appendChild(link);
  }
  
  const metaFields = [
    'description',
    'keywords',
    'robots',
  ];

  metaFields.forEach((field) => {
    let meta = head.querySelector(`meta[name="${field}"]`);

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', field);
      head.appendChild(meta);
    }

    if (seoSettings[field] !== undefined && seoSettings[field] !== null) {
      meta.setAttribute('content', seoSettings[field]);
    }
  });
}
