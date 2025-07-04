export function adFormHtml() {
    const html = document.getElementById('content-area');
    html.innerHTML = `<div id="add-ad" class="container hidden">
                    <!-- Formulario para añadir anuncios -->
                    <h1><i class="fas fa-ad"></i> Añadir Anuncio</h1>
                    
                    <div id="ad-success-message" class="success-message">
                        Anuncio subido correctamente!
                    </div>
                    
                    <form id="ad-form">
                        <div class="form-group">
                            <label for="ad-title">Título</label>
                            <input type="text" id="ad-title" name="title" required>
                            <div id="ad-title-error" class="error-message"></div>
                        </div>

                        <div class="form-group">
                            <label for="brand">Marca</label>
                            <input type="text" id="brand" name="brand" required>
                            <div id="brand-error" class="error-message"></div>
                        </div>
                                        
                        <div class="form-group">
                            <label for="ad-cover">Imagen de portada</label>
                            <div class="file-input-container">
                                <label class="file-input-label" for="cover">
                                    <i class="fas fa-image"></i>
                                    <span id="ad-cover-label-text">Seleccionar archivo...</span>
                                </label>
                                <input type="file" id="ad-cover" name="cover" class="file-input" accept="image/*" required>
                                <div id="ad-cover-name" class="file-name"></div>
                            </div>
                            <div id="ad-cover-error" class="error-message"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="type">Formato del anuncio</label>
                            <select id="ad-type" name="type" required>
                                <option value="" disabled selected>Selecciona un formato</option>
                                <option value="video/mp4">MP4</option>
                                <option value="application/vnd.apple.mpegurl">HLS</option>
                                <option value="audio/mp3">MP3</option>
                            </select>
                            <div id="ad-type-error" class="error-message"></div>
                        </div>

                        <div id="ad-single-content" class="form-group">
                            <label for="content">Archivo de anuncio</label>
                            <div class="file-input-container">
                                <label class="file-input-label" for="content">
                                    <i class="fas fa-file-video"></i>
                                    <span id="ad-label-text">Seleccionar archivo...</span>
                                </label>
                                <input type="file" id="ad-file" name="content" class="file-input" required>
                                <div id="ad-name" class="file-name"></div>
                            </div>
                            <div id="ad-error" class="error-message"></div>
                        </div>
                        
                        <div id="ad-hls-content" class="form-group hidden">
                            <label>Archivos HLS</label>
                            
                            <div class="file-input-container">
                                <label class="file-input-label" for="m3u8">
                                    <i class="fas fa-file-alt"></i>
                                    <span id="ad-m3u8-label-text">Seleccionar archivo .m3u8...</span>
                                </label>
                                <input type="file" id="ad-m3u8" name="m3u8" class="file-input" accept=".m3u8">
                                <div id="ad-m3u8-name" class="file-name"></div>
                            </div>
                            <div id="ad-m3u8-error" class="error-message"></div>
                            
                            <div class="file-input-container">
                                <label class="file-input-label" for="ts1">
                                    <i class="fas fa-file-archive"></i>
                                    <span id="ad-ts1-label-text">Seleccionar playlist 1 (.zip)...</span>
                                </label>
                                <input type="file" id="ad-ts1" name="ts1" class="file-input" accept=".zip">
                                <div id="ad-ts1-name" class="file-name"></div>
                            </div>
                            <div id="ad-ts1-error" class="error-message"></div>
                            
                            <div class="file-input-container">
                                <label class="file-input-label" for="ts2">
                                    <i class="fas fa-file-archive"></i>
                                    <span id="ad-ts2-label-text">Seleccionar playlist 2 (.zip)...</span>
                                </label>
                                <input type="file" id="ad-ts2" name="ts2" class="file-input" accept=".zip">
                                <div id="ad-ts2-name" class="file-name"></div>
                            </div>
                            <div id="ad-ts2-error" class="error-message"></div>
                            
                            <div class="file-input-container">
                                <label class="file-input-label" for="ts3">
                                    <i class="fas fa-file-archive"></i>
                                    <span id="ad-ts3-label-text">Seleccionar playlist 3 (.zip)...</span>
                                </label>
                                <input type="file" id="ad-ts3" name="ts3" class="file-input" accept=".zip">
                                <div id="ad-ts3-name" class="file-name"></div>
                            </div>
                            <div id="ad-ts3-error" class="error-message"></div>
                        </div>
                        
                        <div class="loading" id="ad-loading">
                            <div class="loading-spinner"></div>
                            <p>Subiendo contenido, por favor espere...</p>
                        </div>
                        
                        <button type="submit" class="btn">
                            <i class="fas fa-upload"></i> Subir Contenido
                        </button>
                    </form>

                </div>`;
}