export function getContentTranslations(languages, id) {
    languages.forEach(language => {
        if (language.code != "es") {
            const code = language.code;
            const translations = language.translations;
            let title = '';
            let tagline = '';
            let overview = '';

            translations.forEach((translation) => {
                if (translation.key == `content_${id}_title`) {
                title = translation.value;
                }
                if (translation.key == `content_${id}_tagline`) {
                tagline = translation.value;
                }
                if (translation.key == `content_${id}_overview`) {
                overview = translation.value;
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
        }
    });
}