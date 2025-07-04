// Función para cargar los anuncios dinámicos
        // Esperar a que Video.js esté listo
        var player = videojs("my-video", {}, async function () {
          let postRoll = false;
          let playedMidrolls = new Set(); // Almacena los midrolls ya reproducidos
          let pendingMidrolls = []; // Almacena los midrolls que aún deben reproducirse
          let isPlayingMidroll = false; // Indica si se está reproduciendo un midroll
          let tiempoGuardado = 0; // Variable para guardar el tiempo antes del midroll

          // Obtener el slug de la película desde la URL actual
          const pathParts = window.location.pathname.split("/");
          const movieSlug = pathParts[pathParts.length - 1]; // Extraer el último segmento de la URL

          const { movie, ads } = await loadAds(movieSlug, apiAds, token);

          const movieUrl = backendURL + movie.url;
          const movieType = movie.type;

          // Inicializar ads
          player.ads();

          player.src({
            src: movieUrl,
            type: movieType,
          });

          // Para forzar el reinicio al darle a play después del postroll
          player.on("contentended", function () {
            player.one("play", function () {
              console.log("Reiniciando");
              player.currentTime(0);
              player.play();
            });
          });

          // PREROLL
          const preroll = ads.find((ad) => ad.ad_movie_type === "preroll");
          if (preroll) {
            player.on("readyforpreroll", function () {
              player.ads.startLinearAdMode();
              player.play();
              player.src({
                src: backendURL + preroll.src,
                type: preroll.type
              });

              // Cuando el anuncio empiece, quitar el loader
              player.one("adplaying", function () {
                player.trigger("ads-ad-started");
                skippableAd(player, preroll);
              });

              player.one("adended", function () {
                player.ads.endLinearAdMode();
                player.src({
                  src: movieUrl,
                  type: movieType,
                });
              });
            });
          } else {
            player.trigger("nopreroll");
            player.play();
          }

          // MIDROLLS
          player.on("timeupdate", function () {
            if (isPlayingMidroll) return; // No hacer nada si ya estamos en un midroll

            let currentTime = player.currentTime();

            // Filtrar los midrolls que aún no se han reproducido y deberían haberse activado
            let newMidrolls = ads
              .filter((ad) => ad.ad_movie_type === "midroll")
              .filter(
                (midroll) =>
                  !playedMidrolls.has(midroll.time) &&
                  currentTime >= midroll.time &&
                  !pendingMidrolls.some((p) => p.time === midroll.time) // Evitar duplicados
              );

            // Agregar los nuevos midrolls pendientes y ordenarlos por tiempo
            pendingMidrolls.push(...newMidrolls);
            pendingMidrolls.sort((a, b) => a.time - b.time);

            // Si hay midrolls pendientes y no se está reproduciendo un anuncio, reproducir el primero
            if (pendingMidrolls.length > 0 && !player.ads.isAdPlaying()) {
              playNextMidroll();
            }
          });

          function playNextMidroll() {
            if (pendingMidrolls.length === 0) {
              isPlayingMidroll = false;
              return; // Si no hay más midrolls, salir
            }

            // Evitar iniciar un anuncio si ya está en modo de anuncio
            if (player.ads.isInAdMode()) {
              return;
            }

            isPlayingMidroll = true; // Indicar que un midroll está en reproducción

            let midroll = pendingMidrolls.shift(); // Obtener el siguiente midroll en la lista
            playedMidrolls.add(midroll.time); // Marcarlo como reproducido
            tiempoGuardado = player.currentTime();

            player.ads.startLinearAdMode();
            player.src({
              src: midroll.src,
              type: midroll.type,
            });

            player.one("adplaying", function () {
              player.trigger("ads-ad-started");
            });

            player.one("adended", function () {
              player.ads.endLinearAdMode();
              isPlayingMidroll = false; // Permitir nuevos midrolls
              player.src({
                src: movieUrl,
                type: movieType,
              });

              player.one("loadedmetadata", function () {
                player.currentTime(tiempoGuardado);
                player.play();

                // Si quedan más midrolls, reproducir el siguiente
                if (pendingMidrolls.length > 0) {
                  setTimeout(playNextMidroll, 500); // Pequeña pausa para evitar problemas de carga
                }
              });
            });

            skippableAd(player, midroll);
          }

          // POSTROLL
          const postroll = ads.find((ad) => ad.ad_movie_type === "postroll");
          if (postroll) {
            player.on("contentended", function () {
              player.on("readyforpostroll", function () {
                postRoll = true;
                player.ads.startLinearAdMode();
                player.src({
                  src: postroll.src,
                  type: postroll.type,
                });

                player.one("adplaying", function () {
                  player.trigger("ads-ad-started");
                  skippableAd(player, postroll);
                });

                player.one("adended", function () {
                  player.ads.endLinearAdMode();
                  player.src({
                    src: movieUrl,
                    type: movieType,
                  });
                  player.trigger("ended");
                });
              });
            });

          } else {
            player.trigger("nopostroll");
          }

          player.trigger("adsready");
        });