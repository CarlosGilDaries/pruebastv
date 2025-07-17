const container = document.getElementById('privacy-politic');

async function loadPrivacyPolitic() {
    const response = await fetch('/api/privacy-politic');
    const data = await response.json();

    data.privacyPolitics.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.innerHTML = `<h2 class="title">${item.title}</h2>
                                    ${item.text}`
        container.appendChild(itemContainer);
    });
}

loadPrivacyPolitic();