import { setSeoSettings } from "./modules/setSeoSettings.js";

const seoData = JSON.parse(document.getElementById('seo-data').textContent);
const key = seoData.key;

if (key) {
    setHead(key);
}

async function setHead(key) {
    try {
        const response = await fetch(`/api/generic-seo-settings/${key}`);
        const data = await response.json();
        const seoSettings = data.settings;

        if (seoSettings) {
            setSeoSettings(seoSettings);
        }
    } catch (error) {
        console.log(error);
    }
}