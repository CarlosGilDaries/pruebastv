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
  const names = document.querySelector('.names');
  const texts = document.querySelector('.texts');
  const subtexts = document.querySelector('.subtexts');
  const buttons = document.querySelector('.buttons');
  const footerTexts = document.querySelector('.footer-texts');

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

      if (names) {
        const newName = document.createElement('div');
        newName.classList.add('col-md-6', 'mb3');
        newName.innerHTML = `<label for="${language.code}-name" class="form-label">Nombre (${language.name})</label>
                  <input type="text" class="form-control other-name" id="${language.code}-name" name="${language.code}-name" ${required}>
                  <div id="${language.code}-name-error" class="invalid-feedback"></div>`;
        names.appendChild(newName);
      }

      if (texts) {
        const newText = document.createElement('div');
        newText.classList.add('col-md-6', 'mb3');
        newText.innerHTML = `<label for="${language.code}-text" class="form-label">Texto (${language.name})</label>
                  <input type="text" class="form-control other-text" id="${language.code}-text" name="${language.code}-text" ${required}>
                  <div id="${language.code}-text-error" class="invalid-feedback"></div>`;
        texts.appendChild(newText);
      }

      if (subtexts) {
        const newSubtext = document.createElement('div');
        newSubtext.classList.add('col-md-6', 'mb3');
        newSubtext.innerHTML = `<label for="${language.code}-subtext" class="form-label">Subtexto (${language.name})</label>
                  <input type="text" class="form-control other-subtext" id="${language.code}-subtext" name="${language.code}-subtext" ${required}>
                  <div id="${language.code}-subtext-error" class="invalid-feedback"></div>`;
        subtexts.appendChild(newSubtext);
      }

      if (buttons) {
        const newButton = document.createElement('div');
        newButton.classList.add('col-md-6', 'mb3');
        newButton.innerHTML = `<label for="${language.code}-button" class="form-label">Texto del Botón (${language.name})</label>
                  <input type="text" class="form-control other-button" id="${language.code}-button" name="${language.code}-button" ${required}>
                  <div id="${language.code}-button-error" class="invalid-feedback"></div>`;
        buttons.appendChild(newButton);
      }

      if (footerTexts) {
        const newFooterText = document.createElement('div');
        newFooterText.classList.add('mb-3');
        newFooterText.innerHTML = `<label for="${language.code}-text" class="form-label">Contenido (${language.name})</label>
                        <textarea class="form-control other-text ckeeditor wysiwyg-textarea" id="${language.code}-text" name="${language.code}-text" rows="5"></textarea>
                        <div id="${language.code}-text-error" class="invalid-feedback"></div`;
        footerTexts.appendChild(newFooterText);
        CKEDITOR.replace(`${language.code}-text`);
      }
    }
  });
}