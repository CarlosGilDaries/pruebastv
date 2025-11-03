export function setSeoSettings(seoSettings) {
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
      meta.setAttribute('content', seoSettings[field]);
      /*if (field == 'url') {
        window.history.replaceState({}, '', seoSettings[field]);
      }*/
    }
  });
}
