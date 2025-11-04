export function setSeoSettings(seoSettings) {
  console.log(seoSettings['key']);
  const head = document.head;

  const metaFields = [
    'alias',
    'description',
    'keywords',
    'robots',
    'title',
    'url',
  ];

  metaFields.forEach((field) => {
    let meta = head.querySelector(`meta[name="${field}"]`);

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', field);
      head.appendChild(meta);
    }

    if (seoSettings[field] !== undefined && seoSettings[field] !== null) {
      if (field === 'url' && seoSettings['key'] !== 'index') {
        meta.setAttribute(
          'content',
          'https://pruebastv.kmc.es' + seoSettings[field]
        );
      } else {
        meta.setAttribute('content', seoSettings[field]);
      }
    }
  });
}
