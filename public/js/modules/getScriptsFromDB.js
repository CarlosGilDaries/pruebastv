export function getScriptsFromKey(scripts, key) {
  let values;
  scripts.forEach((script) => {
    if (script.key == key) {
      values = script;
    }
  });

  return values;
}

export function getScriptsValues(script) {
  document.getElementById('code').value = script.code;
  document.getElementById('google_id').value = script.google_id;
}
