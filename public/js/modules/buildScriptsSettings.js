export function buildScriptInputs() {
  const div = document.getElementById('scripts-inputs');
  const scriptFields = `
          <h3 class="mb-2">Google Analytics</h3>
          <div class="row">
              <div class="col-12 mb-3">
                <label for="google-code" class="form-label">Código</label>
                <textarea class="form-control" id="google-code" name="google-code"></textarea>
                <div id="google-code-error" class="invalid-feedback"></div>
              </div>
          </div>
          
    `;

    div.innerHTML = scriptFields;
}

export function buildScriptFormData(type) {
  const scriptFormData = new FormData();
  let script = false;

  const fields = [
    { id: type + '-code', name: 'code' },
  ];

  fields.forEach((field) => {
    const element = document.getElementById(field.id);
    if (element && element.value.trim() !== '') {
      scriptFormData.append(field.name, element.value.trim());
      script = true;
    }
  });

  if (script) {
    scriptFormData.append('type', type);
  }

  return { scriptFormData, script };
}

export function getScriptValues(script) {
  document.getElementById(script.type + '-code').value = script.code;
}
