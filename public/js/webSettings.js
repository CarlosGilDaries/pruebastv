async function loadWebSettings() {
  try {
    const companyDetailsResponse = await fetch('/api/company-details');
    const compapanyDetailsData = await companyDetailsResponse.json();
    const footerItemsResponse = await fetch('/api/footer-items');
    const footerItemsData = await footerItemsResponse.json();

    const details = compapanyDetailsData.details;
    const facebookUrl = details.facebook;
    const instagramUrl = details.instagram;
    const twitterUrl = details.twitter;
    const logoUrl = details.logo;
    const faviconUrl = details.favicon;
    const items = footerItemsData.footerItems;

    const logo = document.getElementById('logo');
    const favicon = document.getElementById('favicon');
    const itemsContainer = document.querySelector('.items-container');
    const facebook = document.getElementById('facebook');
    const instagram = document.getElementById('instagram');
    const twitter = document.getElementById('twitter');
    logo.src = logoUrl;
    favicon.href = faviconUrl;
    if (itemsContainer) {
      facebook.href = facebookUrl;
      instagram.href = instagramUrl;
      twitter.href = twitterUrl;
      items.forEach((item) => {
        const link = document.createElement('a');
        link.href = item.url;
        const img = document.createElement('img');
        img.src = item.logo;
        img.alt = item.name;
        link.appendChild(img);
        itemsContainer.appendChild(link);
      });
    }
  } catch (error) {
    console.log(error);
  }
}

loadWebSettings();
