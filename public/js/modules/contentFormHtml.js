export function contentFormHtml() {
  const html = document.getElementById('content-area');
  html.innerHTML = `<div class="container" id="add-content">                    
                    <h1><i class="fas fa-film"></i> Añadir Nuevo Contenido</h1>
                    
                    <div id="success-message" class="success-message">
                        Contenido subido con éxito!
                    </div>
                    <!-- Formulario apra añadir contenido -->
                    <form id="content-form">
                        <!-- Campos básicos -->
                        <div class="form-group">
                            <label for="title">Título</label>
                            <input type="text" id="title" name="title" required>
                            <div id="title-error" class="error-message"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="tagline">Resumen corto</label>
                            <textarea id="tagline" name="tagline" class="ckeditor wysiwyg-textarea"></textarea>
                            <div id="tagline-error" class="error-message"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="overview">Descripción</label>
                            <textarea id="overview" name="overview" class="ckeditor wysiwyg-textarea"></textarea>
                            <div id="overview-error" class="error-message"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="cover">Imagen de portada</label>
                            <div class="file-input-container">
                                <label class="file-input-label" for="cover">
                                    <i class="fas fa-image"></i>
                                    <span id="cover-label-text">Seleccionar archivo...</span>
                                </label>
                                <input type="file" id="cover" name="cover" class="file-input" accept="image/*" required>
                                <div id="cover-name" class="file-name"></div>
                            </div>
                            <div id="cover-error" class="error-message"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="trailer">Trailer</label>
                            <div class="file-input-container">
                                <label class="file-input-label" for="trailer">
                                    <i class="fas fa-film"></i>
                                    <span id="trailer-label-text">Seleccionar archivo MP4...</span>
                                </label>
                                <input type="file" id="trailer" name="trailer" class="file-input" accept="video/mp4">
                                <div id="trailer-name" class="file-name"></div>
                            </div>
                            <div id="trailer-error" class="error-message"></div>
                        </div>

                        <!-- Planes -->
                        <div class="form-group">
                            <label for="checkbox-container">Vincular a plan/es</label>
                            <div id="plans-container"></div>
                            <div id="plan-error" class="error-message"></div>
                        </div>

                        <!-- Género -->            
                        <div class="form-group">
                            <label for="gender_id">Género</label>
                            <select id="gender_id" name="gender_id" required>
                                <option value="" disabled selected>Selecciona un género</option>
                                <option value=1>Acción</option>
                                <option value=2>Aventuras</option>
                                <option value=3>Ciencia ficción</option>
                                <option value=4>Comedia</option>
                                <option value=5>Drama</option>
                                <option value=6>Terror/Suspense</option>
                                <option value=7>Fantasía</option>
                                <option value=8>Romance</option>
                                <option value=9>Thriller</option>
                                <option value=10>Crimen/Misterio</option>
                                <option value=11>Bélico</option>
                                <option value=12>Histórico</option>
                                <option value=13>Animación</option>
                                <option value=14>Documental</option>
                                <option value=15>Musical</option>
                                <option value=16>Western</option>
                                <option value=17>Deportivo</option>
                                <option value=18>Biográfico</option>
                                <option value=19>Entrevistas</option>
                                <option value=20>Noticias/Actualidad</option>
                                <option value=21>Educativo</option>
                                <option value=22>True Crime</option>
                                <option value=23>Humor</option>
                                <option value=24>Salud/Bienestar</option>
                                <option value=2>Negocios/Emprendimiento</option>
                                <option value=27>Tecnología</option>
                                <option value=28>Cultura Pop</option>
                                <option value=29>Política/Sociedad</option>
                                <option value=30>Gaming</option>
                                <option value=31>Conciertos/Música en vivo</option>
                                <option value=32>Eventos deportivos</option>
                                <option value=33>Charlas/Webinars</option>
                                <option value=34>Tutoriales</option>
                                <option value=35>Reacciones</option>
                                <option value=36>Fitness/Wellness</option>
                            </select>
                            <div id="gender_id-error" class="error-message"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="type">Formato del contenido</label>
                            <select id="type" name="type" required>
                                <option value="" disabled selected>Selecciona un formato</option>
                                <option value="video/mp4">MP4</option>
                                <option value="application/vnd.apple.mpegurl">HLS</option>
                                <option value="audio/mp3">MP3</option>
                                <option value="iframe">Iframe</option>
                                <option value="url">URL</option>
                            </select>
                            <div id="type-error" class="error-message"></div>
                        </div>

                        <!-- Contenido normal -->
                        <div id="single-content" class="form-group">
                            <label for="content">Archivo de contenido</label>
                            <div class="file-input-container">
                                <label class="file-input-label" for="content">
                                    <i class="fas fa-file-video"></i>
                                    <span id="content-label-text">Seleccionar archivo...</span>
                                </label>
                                <input type="file" id="content" name="content" class="file-input" required>
                                <div id="content-name" class="file-name"></div>
                            </div>
                            <div id="content-error" class="error-message"></div>
                        </div>
                        
                        <!-- Contenido HLS -->
                        <div id="hls-content" class="form-group hidden">
                            <label>Archivos HLS</label>
                            
                            <div class="file-input-container">
                                <label class="file-input-label" for="m3u8">
                                    <i class="fas fa-file-alt"></i>
                                    <span id="m3u8-label-text">Seleccionar archivo .m3u8...</span>
                                </label>
                                <input type="file" id="m3u8" name="m3u8" class="file-input" accept=".m3u8">
                                <div id="m3u8-name" class="file-name"></div>
                            </div>
                            <div id="m3u8-error" class="error-message"></div>
                            
                            <div class="file-input-container">
                                <label class="file-input-label" for="ts1">
                                    <i class="fas fa-file-archive"></i>
                                    <span id="ts1-label-text">Seleccionar playlist 1 (.zip)...</span>
                                </label>
                                <input type="file" id="ts1" name="ts1" class="file-input" accept=".zip">
                                <div id="ts1-name" class="file-name"></div>
                            </div>
                            <div id="ts1-error" class="error-message"></div>
                            
                            <div class="file-input-container">
                                <label class="file-input-label" for="ts2">
                                    <i class="fas fa-file-archive"></i>
                                    <span id="ts2-label-text">Seleccionar playlist 2 (.zip)...</span>
                                </label>
                                <input type="file" id="ts2" name="ts2" class="file-input" accept=".zip">
                                <div id="ts2-name" class="file-name"></div>
                            </div>
                            <div id="ts2-error" class="error-message"></div>
                            
                            <div class="file-input-container">
                                <label class="file-input-label" for="ts3">
                                    <i class="fas fa-file-archive"></i>
                                    <span id="ts3-label-text">Seleccionar playlist 3 (.zip)...</span>
                                </label>
                                <input type="file" id="ts3" name="ts3" class="file-input" accept=".zip">
                                <div id="ts3-name" class="file-name"></div>
                            </div>
                            <div id="ts3-error" class="error-message"></div>
                        </div>
                        
                        <!-- Iframe/URL -->
                        <div id="external-content" class="form-group hidden">
                            <div class="form-group">
                                <label for="external_url">URL del contenido</label>
                                <input type="text" id="external_url" name="external_url" placeholder="https://...">
                                <div id="external_url-error" class="error-message"></div>
                            </div>
                        </div>
                            
                        <div class="form-group">
                            <label for="duration">Duración</label>
                            <input type="time" name="duration" id="duration" step="1">
                            <div id="duration-error" class="error-message"></div>
                        </div>                        
                        
                        <!-- Pay Per View -->
                        <div class="form-group">
                            <label class="checkbox-container">
                                <input type="checkbox" id="pay_per_view" name="pay_per_view">
                                <span class="checkmark"></span>
                                <p>¿Es contenido Pay Per View?</p>
                            </label>
                            <div id="pay_per_view-error" class="error-message"></div>
                        </div>
                        
                        <div id="pay_per_view_fields" class="form-group hidden">
                            <div class="form-group">
                                <label for="pay_per_view_price">Precio (€)</label>
                                <input type="number" id="pay_per_view_price" name="pay_per_view_price" min="0" step="0.01" placeholder="0.00">
                                <div id="pay_per_view_price-error" class="error-message"></div>
                            </div>
                        </div>
                        
                        <!-- Disponibilidad -->
                        <div class="form-group">
                            <label for="start_time">Fecha/hora de inicio (opcional)</label>
                            <input type="datetime-local" id="start_time" name="start_time">
                            <div id="start_time-error" class="error-message"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="end_time">Fecha/hora de fin (opcional)</label>
                            <input type="datetime-local" id="end_time" name="end_time">
                            <div id="end_time-error" class="error-message"></div>
                        </div>
                        
                        <div class="loading" id="loading">
                            <div class="loading-spinner"></div>
                            <p>Subiendo contenido, por favor espere...</p>
                        </div>
                        
                        <button type="submit" class="btn">
                            <i class="fas fa-upload"></i> Subir Contenido
                        </button>
                    </form>
                </div>`;
}
