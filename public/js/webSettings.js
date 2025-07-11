async function loadWebSettings() {
    try {
        const companyDetailsResponse = await fetch('/api/company-details');
        const compapanyDetailsData = await companyDetailsResponse.json();

        console.log(compapanyDetailsData);
        const details = compapanyDetailsData.details;
        const facebook = details.facebook;
        const instagram = details.instagram;
        const twitter = details.twitter;
        const logoUrl = details.logo;
        const faviconUrl = details.favicon;

        const logo = document.getElementById('logo');
        const favicon = document.getElementById('favicon');
        logo.src = logoUrl;
        favicon.href = faviconUrl;

    } catch (error) {
        console.log(error);
    }
}

loadWebSettings();