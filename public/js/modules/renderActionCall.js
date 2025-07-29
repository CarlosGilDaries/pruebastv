export function renderActionCall(main, action) {
  const section = document.createElement('section');
  section.classList.add('action-call');
  section.innerHTML = `
        <div class="action-call-content" style="background-image: url('${
          action.picture
        }')">
            <div class="action-call-text">
                <h2 data-i18n="action_${action.id}_text">${action.text}</h2>
                ${
                  action.subtext
                    ? `<p data-i18n="action_${action.id}_subtext">${action.subtext}</p>`
                    : ''
                }
                <a href="${action.url}" data-i18n="action_${
    action.id
  }_button" class="action-button">${action.button_text}</a>
            </div>
        </div>
    `;
  main.appendChild(section);
}
