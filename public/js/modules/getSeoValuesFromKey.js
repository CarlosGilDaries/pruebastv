export function getSeoValuesFromKey(seoSettings, key) {
  let values;
  seoSettings.forEach((setting) => {
    if (setting.key == key) {
      values = setting;
    }
  });

  return values;
}