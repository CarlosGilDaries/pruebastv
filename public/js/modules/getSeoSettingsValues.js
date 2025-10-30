export function getSeoSettingsValues(seoSettings) {
    document.getElementById('seo-title').value = seoSettings.title;
    document.getElementById('seo-robots').value = seoSettings.robots;
    document.getElementById('seo-alias').value = seoSettings.alias;
    document.getElementById('seo-description').value = seoSettings.description;
    document.getElementById('seo-url').value = seoSettings.url;
    document.getElementById('seo-keywords').value = seoSettings.keywords;
}