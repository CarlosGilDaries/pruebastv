export async function getPlansUrl(element) {
  try {
    const response = await fetch('/api/generic-seo-settings/plans');
    const data = await response.json();
    const url = data.settings.url;
    element.href = url;
  } catch (error) {
    console.log(error);
  }
}