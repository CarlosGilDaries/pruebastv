import { setupSlugGenerator } from "./setUpSlugGeneratos.js";

export function buildSeoInputs() {
    const div = document.getElementById('seo-inputs');
    console.log(div);
    const seoFields = `
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="seo-title" class="form-label">Title</label>
          <input type="text" class="form-control" id="seo-title" name="seo-title" />
          <div id="seo-title-error" class="invalid-feedback"></div>
        </div>
        <div class="col-md-6 mb-3">
          <label for="seo-url" class="form-label">Alias</label>
          <input type="text" class="form-control" id="seo-url" name="seo-url">
          <div id="seo-url-error" class="invalid-feedback"></div>
        </div>
      </div>
      <div class="row">
      <div class="col-md-6 mb-3">
          <label for="seo-keywords" class="form-label">Keywords</label>
          <input type="text" class="form-control" id="seo-keywords" name="seo-keywords" />
          <div id="seo-keywords-error" class="invalid-feedback"></div>
        </div>
        <div class="col-md-6 mb-3">
          <label for="seo-robots" class="form-label">Robots</label>
          <input type="text" class="form-control" id="seo-robots" name="seo-robots" />
          <div id="seo-robots-error" class="invalid-feedback"></div>
        </div>
      </div>
      <div class="row">
        <div class="col-12 mb-3">
          <label for="seo-canonical" class="form-label">Canonical</label>
          <input type="text" class="form-control" id="seo-canonical" name="seo-canonical" />
          <div id="seo-canonical-error" class="invalid-feedback"></div>
        </div>
      </div>
      <div class="row">
        <div class="col-12 mb-3">
          <label for="seo-description" class="form-label">Description</label>
          <input type="text" class="form-control" id="seo-description" name="seo-description">
          <div id="seo-description-error" class="invalid-feedback"></div>
        </div>
      </div>
    `;

    div.innerHTML = seoFields;

    setupSlugGenerator('seo-title', 'seo-url');
}