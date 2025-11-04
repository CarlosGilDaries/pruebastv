export async function dropDownTypeMenu(dropDownMenuElement, types, type) {
  try {
    const seoResponse = await fetch(`/api/generic-seo-settings/${types}`);
    const seoData = await seoResponse.json();
    const seoSettings = seoData.settings;
    let location;
    if (seoSettings && seoSettings.url) {
      location = seoSettings.url;
    } else {
      location = `/${types}.html`;
    }
    const response = await fetch(`/api/${types}`);
    const data = await response.json();
    const items = data[types];
    let counter = 0;

    dropDownMenuElement.innerHTML = '';
    items.forEach((item) => {
      counter++;
      if (counter <= 7) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.classList.add('dropdown-item');
        if (item.seo_setting && item.seo_setting.url) {
          a.href = item.seo_setting.url;
        } else {
          a.href = `/${type}-show.html?id=${item.id}`;
        }
        a.textContent = item.name;
        a.setAttribute('data-i18n', `${type}_${item.id}`);
        li.appendChild(a);
        dropDownMenuElement.appendChild(li);
      }
    });
    const seeMore = document.createElement('li');
    const seeMoreLink = document.createElement('a');
    seeMoreLink.classList.add('dropdown-item');
    seeMoreLink.href = location;
    seeMoreLink.textContent = 'Ver Más';
    seeMoreLink.setAttribute('data-i18n', 'see_more');
    seeMore.appendChild(seeMoreLink);
    dropDownMenuElement.appendChild(seeMore);

    // Manejar el dropdown en móviles
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdown = document.querySelector('.dropdown');

    dropdownToggle.addEventListener('click', function (e) {
      if (window.innerWidth <= 991) {
        e.preventDefault();
        dropdown.classList.toggle('active');
      }
    });
  } catch (error) {
    console.log(error);
  }
}
