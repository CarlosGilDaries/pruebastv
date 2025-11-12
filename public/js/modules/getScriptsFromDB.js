export function getScriptsByKey(scripts, key) {
  const result = {};

  scripts.forEach((script) => {
    if (script.key === key) {
      result[script.type] = script.code;
      if (script.site_id != null) {
        result[script.type + '_id'] = script.site_id;
      }
    }
  });

  return result;
}

export function getScriptsValues(script) {
  document.getElementById('code').value = script.code;
}
