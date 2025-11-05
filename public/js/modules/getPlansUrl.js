export async function getPlansUrl(element) {
  try {
    const response = await fetch('/api/generic-seo-settings/plans');
    const data = await response.json();
    let url;
    if (data.settings != null && data.settings.url != null) { 
        url = data.settings.url;
    } else {
        url = '/plans.html';
    }
    element.href = url;
  } catch (error) {
    console.log(error);
  }
}