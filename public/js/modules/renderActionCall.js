export function renderActionCall(main, action) {
  const section = document.createElement('section');
  section.classList.add('action-call');
  section.innerHTML = `
        <div class="action-call-content" style="background-image: url('${
          action.picture
        }')">
            <div class="action-call-text">
                <h2>${action.text}</h2>
                ${action.subtext ? `<p>${action.subtext}</p>` : ''}
                <a href="${action.url}" class="action-button">${
    action.button_text
  }</a>
            </div>
        </div>
    `;
  main.appendChild(section);
}
