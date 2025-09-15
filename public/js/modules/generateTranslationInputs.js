export async function generateTranslationInputs(token) {
  const languagesResponse = await fetch(`/api/all-languages`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const languagesData = await languagesResponse.json();
  const languages = languagesData.languages;
  const titles = document.querySelector('.titles');
  const taglines = document.querySelector('.taglines');
  const overviews = document.querySelector('.overviews');

  languages.forEach((language) => {
    if (language.code != 'es') {
      let required;
      if (language.is_active == 1) {
        required = 'required';
      } else {
        required = '';
      }

      if (titles) {
        const newTitle = document.createElement('div');
        newTitle.classList.add('col-md-6', 'mb3');
        newTitle.innerHTML = `<label for="${language.code}-title" class="form-label">Título (${language.name})</label>
                  <input type="text" class="form-control other-title" id="${language.code}-title" name="${language.code}-title" ${required}>
                  <div id="${language.code}-title-error" class="invalid-feedback"></div>`;
        titles.appendChild(newTitle);
      }

      if (taglines) {
        const newTagline = document.createElement('div');
        newTagline.classList.add('mb-3');
        newTagline.innerHTML = `<label for="${language.code}-tagline" class="form-label">Resumen corto (${language.name})</label>
                        <textarea class="form-control other-tagline ckeeditor wysiwyg-textarea" id="${language.code}-tagline" name="${language.code}-tagline" rows="3"></textarea>
                        <div id="${language.code}-tagline-error" class="invalid-feedback"></div`;
        taglines.appendChild(newTagline);
        CKEDITOR.replace(`${language.code}-tagline`);
      }

      if (overviews) {
        const newOverview = document.createElement('div');
        newOverview.classList.add('mb-3');
        newOverview.innerHTML = `<label for="${language.code}-overview" class="form-label">Descripción (${language.name})</label>
                        <textarea class="form-control other-overview ckeeditor wysiwyg-textarea" id="${language.code}-overview" name="${language.code}-overview" rows="5"></textarea>
                        <div id="${language.code}-overview-error" class="invalid-feedback"></div`;
        overviews.appendChild(newOverview);
        CKEDITOR.replace(`${language.code}-overview`);
      }
    }
  });
}