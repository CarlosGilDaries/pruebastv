async function renderCategoriesAndGenders() {
    try {
        const gendersContainer = document.getElementById('genders');
        const categoriesContainer = document.getElementById('categories');
        const tagsContainer = document.getElementById('tags');
        const actionsContainer = document.getElementById('actions');
        const contentContainer = document.getElementById('content');

        const categoriesResponse = await fetch('/api/dropdown-categories-menu');
        const gendersResponse = await fetch('/api/genders');
        const tagsResponse = await fetch('/api/tags');
        const actionsResponse = await fetch('/api/actions');
        const contentResponse = await fetch('/api/content');

        const categoriesData = await categoriesResponse.json();
        const gendersData = await gendersResponse.json();
        const tagsData = await tagsResponse.json();
        const actionsData = await actionsResponse.json();
        const contentData = await contentResponse.json();

        const categories = categoriesData.categories;
        const genders = gendersData.genders;
        const tags = tagsData.tags;
        const actions = actionsData.actions;
        const contents = contentData.data.movies;

        let genderFormHtml = `<div class="col-md-6">
                                            <label for="translation_gender_title" class="form-label">"Géneros" (Document title)</label>
                                            <input value="Géneros" type="text" class="form-control" id="translation_gender_title" name="translations[gender_title]" required>
                                       </div>
                                <div class="col-md-6">
                                            <label for="translation_gender_heading" class="form-label">"Géneros" (encabezado)</label>
                                            <input value="Géneros" type="text" class="form-control" id="translation_gender_heading" name="translations[gender_heading]" required>
                                        </div>`;
        let categoryFormHtml = `<div class="col-md-6">
                                            <label for="translation_category_title" class="form-label">"Categorías" (Document title)</label>
                                            <input value="Categorías" type="text" class="form-control" id="translation_category_title" name="translations[category_title]" required>
                                       </div>
                                       <div class="col-md-6">
                                            <label for="translation_category_heading" class="form-label">"Categorías" (encabezado)</label>
                                            <input value="Categorías" type="text" class="form-control" id="translation_category_heading" name="translations[category_heading]" required>
                                        </div>`;
        let tagFormHtml = `<div class="col-md-6">
                                <label for="translation_tag_title" class="form-label">"Etiquetas" (Document title)</label>
                                            <input value="Etiquetas" type="text" class="form-control" id="translation_tag_title" name="translations[tag_title]" required>
                                            </div>
                                <div class="col-md-6">
                                    <label for="translation_tag_heading" class="form-label">"Etiquetas" (encabezado)</label>
                                    <input value="Etiquetas" type="text" class="form-control" id="translation_tag_heading" name="translations[tag_heading]" required>
                                </div>`;
        
        let actionFormHtml = "";
        let contentFormHtml = `<div class="col-md-6">
        <label for="translation_watch_now" class="form-label">"Botón Ver Ahora"</label>
        <input value="Ver Ahora" type="text" class="form-control" id="translation_watch_now" name="translations[watch_now]" required>
    </div>`;
                            
        genders.forEach(gender => {
            const columnHtml = `<div class="col-md-6">
                                    <label for="translation_gender_${gender.id}" class="form-label">"${gender.name}"</label>
                                    <input value="${gender.name}" type="text" class="form-control" id="translation_gender_${gender.id}" name="translations[gender_${gender.id}]" required>
                                </div>`;
            genderFormHtml += columnHtml;
        });
        const gendersRow = document.createElement('div');
        gendersRow.classList.add('row', 'g-3');
        gendersRow.innerHTML = genderFormHtml;
        gendersContainer.appendChild(gendersRow);

        categories.forEach((category) => {
          const columnHtml = `<div class="col-md-6">
                                    <label for="translation_category_${category.id}" class="form-label">"${category.name}"</label>
                                    <input value="${category.name}" type="text" class="form-control" id="translation_category_${category.id}" name="translations[category_${category.id}]" required>
                                </div>`;
          categoryFormHtml += columnHtml;
        });
        const categoriesRow = document.createElement('div');
        categoriesRow.classList.add('row', 'g-3');
        categoryFormHtml += `<div class="col-md-6">
                                    <label for="translation_keep_watching" class="form-label">"Seguir viendo"</label>
                                    <input value="Seguir viendo" type="text" class="form-control" id="translation_keep_watching" name="translations[keep_watching]" required>
                                </div>`;
        categoriesRow.innerHTML = categoryFormHtml;
        categoriesContainer.appendChild(categoriesRow);

        tags.forEach((tag) => {
          const columnHtml = `<div class="col-md-6">
                                    <label for="translation_tag_${tag.id}" class="form-label">"${tag.name}"</label>
                                    <input value="${tag.name}" type="text" class="form-control" id="translation_tag_${tag.id}" name="translations[tag_${tag.id}]" required>
                                </div>`;
          tagFormHtml += columnHtml;
        });
        const tagsRow = document.createElement('div');
        tagsRow.classList.add('row', 'g-3');
        tagsRow.innerHTML = tagFormHtml;
        tagsContainer.appendChild(tagsRow);

        actions.forEach((action) => {
          const columnHtml = `<div class="col-md-6">
                                    <label for="translation_action_${action.id}_button" class="form-label">"${action.button_text}"</label>
                                    <input value="${action.button_text}" type="text" class="form-control" id="translation_action_${action.id}_button" name="translations[action_${action.id}_button]" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="translation_action_${action.id}_subtext" class="form-label">"${action.subtext}"</label>
                                    <input value="${action.subtext}" type="text" class="form-control" id="translation_action_${action.id}_subtext" name="translations[action_${action.id}_subtext]" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="translation_action_${action.id}_text" class="form-label">"${action.text}"</label>
                                    <input value="${action.text}" type="text" class="form-control" id="translation_action_${action.id}_text" name="translations[action_${action.id}_text]" required>
                                </div>`;
                                ;
          actionFormHtml += columnHtml;
        });
        const actionsRow = document.createElement('div');
        actionsRow.classList.add('row', 'g-3');
        actionsRow.innerHTML = actionFormHtml;
        actionsContainer.appendChild(actionsRow);

        contents.forEach((content) => {
          const columnHtml = `<div class="col-md-6">
        <label for="translation_content_${content.id}_title" class="form-label">"${content.title}"</label>
        <input value="${content.title}" type="text" class="form-control" id="translation_content_${content.id}_title" name="translations[content_${content.id}_title]" required>
    </div>
    <div class="col-md-6">
        <label for="translation_content_${content.id}_tagline" class="form-label">"${content.title} Resumen corto"</label>
        <textarea class="form-control ckeditor wysiwyg-textarea" id="translation_content_${content.id}_tagline" name="translations[content_${content.id}_tagline]" rows="3"></textarea>
    </div>
    <div class="col-md-6">
        <label for="translation_content_${content.id}_overview" class="form-label">"${content.title} Descripción"</label>
        <textarea class="form-control ckeditor wysiwyg-textarea" id="translation_content_${content.id}_overview" name="translations[content_${content.id}_overview]" rows="3"></textarea>
    </div>`;
          contentFormHtml += columnHtml;
        });

        const contentRow = document.createElement('div');
        contentRow.classList.add('row', 'g-3');
        contentRow.innerHTML = contentFormHtml;
        contentContainer.appendChild(contentRow);

        // Inicializar CKEditor para los nuevos textareas
        const newTextareas = contentRow.querySelectorAll('textarea.ckeditor');

        newTextareas.forEach((textarea) => {
          CKEDITOR.replace(textarea.id);

          // Esperar a que cada instancia esté lista
          CKEDITOR.on('instanceReady', function (evt) {
            const editor = evt.editor;
            const id = editor.name;

            // Buscar el contenido relacionado
            const contentId = id.match(/translation_content_(\d+)_/)[1];
            const content = contents.find((c) => c.id == contentId);

            if (id.endsWith('_tagline')) {
              editor.setData(content.tagline || '');
            } else if (id.endsWith('_overview')) {
              editor.setData(content.overview || '');
            }
          });
        });

    } catch (error) {
        console.log(error);
    }
}

renderCategoriesAndGenders();