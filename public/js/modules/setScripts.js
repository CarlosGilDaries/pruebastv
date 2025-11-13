export async function setGoogleAnalyticsScript(scriptsArray = null, page = null) {
    const acceptedGACookie = localStorage.getItem('cb_analyticsAccepted');
    if (acceptedGACookie != 'yes' || !acceptedGACookie) return;

    const response = await fetch('/api/scripts');
    const data = await response.json();

    let googleAnalyticsBaseScript;
    let googleAnalyticsCustomScript;

    data.scripts.forEach(script => {
        if (script.key == 'base-google') {
          googleAnalyticsBaseScript = script;
        }
    })

    if (!googleAnalyticsBaseScript) return;

    if (scriptsArray != null) {
        scriptsArray.forEach((scriptElement) => {
          if (scriptElement.type == 'google') {
            googleAnalyticsCustomScript = scriptElement;
          }
        });
    }
    else if (page != null) {
        const customResponse = await fetch(
          `/api/generic-script/${page}/google`
        );
        const customData = await customResponse.json();
        console.log(customData);
        googleAnalyticsCustomScript = customData.script;
    }
    
    const head = document.head;
    const gtagScriptTag = document.createElement('script');
    gtagScriptTag.id = 'ga-script-1';
    gtagScriptTag.async = true;
    gtagScriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsBaseScript.site_id}`;
    const googleAnalyticsScriptTag = document.createElement('script');
    googleAnalyticsScriptTag.id = "ga-script-2";
    if (!googleAnalyticsCustomScript) {
        googleAnalyticsScriptTag.innerHTML = googleAnalyticsBaseScript.code;
    } else {
        googleAnalyticsScriptTag.innerHTML = googleAnalyticsCustomScript.code;
    }

    head.appendChild(gtagScriptTag);
    head.appendChild(googleAnalyticsScriptTag);
}