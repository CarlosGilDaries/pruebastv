export function getContentTranslations(languages, id) {
    languages.forEach(language => {
        if (language.code != "es") {
            const code = language.code;
            const translations = language.translations;
            let title = '';
            let tagline = '';
            let overview = '';
            let name = '';
            let text = '';
            let subtext = '';
            let button = '';
            let footerText = '';

            translations.forEach((translation) => {
                if (
                  (translation.key == `content_${id}_title` &&
                    document.getElementById(`${code}-title`)) ||
                  (translation.key == `privacy_politic_${id}_title` &&
                    document.getElementById(`${code}-title`))
                ) {
                  title = translation.value;
                }
                if (
                  translation.key == `content_${id}_tagline` &&
                  CKEDITOR.instances[`${code}-tagline`]
                ) {
                  tagline = translation.value;
                }
                if (
                  translation.key == `content_${id}_overview` &&
                  CKEDITOR.instances[`${code}-overview`]
                ) {
                  overview = translation.value;
                }
                if (
                  (translation.key == `gender_${id}` &&
                    document.getElementById('edit-gender')) ||
                  (translation.key == `category_${id}` &&
                        document.getElementById('edit-category')) ||
                    (translation.key == `tag_${id}` && document.getElementById('edit-tag'))
                ) {
                  name = translation.value;
                }
                if (translation.key == `action_${id}_text` && document.getElementById('edit-action')) {
                    text = translation.value;
                }
                if (
                  translation.key == `action_${id}_subtext` &&
                  document.getElementById('edit-action')
                ) {
                  subtext = translation.value;
                }
                if (
                  translation.key == `action_${id}_button` &&
                  document.getElementById('edit-action')
                ) {
                  button = translation.value;
                }
                if (translation.key == `privacy_politic_${id}_text` && document.getElementById('edit-privacy-politic')) {
                    footerText = translation.value;
                }
            });

            if (title != '') {
                document.getElementById(`${code}-title`).value = title;
            }
            if (tagline != '') {
                CKEDITOR.instances[`${code}-tagline`].setData(tagline);
            }
            if (overview != '') {
                CKEDITOR.instances[`${code}-overview`].setData(overview);
            }
            if (name != '') {
                document.getElementById(`${code}-name`).value = name;
            }
            if (text != '') {
                document.getElementById(`${code}-text`).value = text;
            }
            if (subtext != '') {
              document.getElementById(`${code}-subtext`).value = subtext;
            }
            if (button != '') {
              document.getElementById(`${code}-button`).value = button;
            }
            if (footerText != '') {
                CKEDITOR.instances[`${code}-text`].setData(footerText);
            }
        }
    });
}