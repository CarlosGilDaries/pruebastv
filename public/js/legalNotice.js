const container = document.getElementById('legal-notice');

async function loadLegalNotice() {
    const response = await fetch('/api/legal-notice');
    const data = await response.json();

    data.legalNotices.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.innerHTML = `<h2 class="title">${item.title}</h2>
                                    ${item.text}`
        container.appendChild(itemContainer);
    });
}

loadLegalNotice();