(function () {
    // ---------------------------
    // Helper: Cookie functions
    // ---------------------------
    function getCookie(name) {
        return document.cookie.split("; ").reduce((acc, part) => {
            const [k, v] = part.split("=");
            return k === encodeURIComponent(name) ? decodeURIComponent(v) : acc;
        }, null);
    }

    function setCookie(name, value, days = 1) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    }

    // ---------------------------
    // Generate UUID
    // ---------------------------
    function uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // ---------------------------
    // Detect Device
    // ---------------------------
    function detectDevice() {
        const ua = navigator.userAgent;
        if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
        if (/Android/i.test(ua)) return "Android";
        if (/Windows/i.test(ua)) return "Windows";
        if (/Macintosh/i.test(ua)) return "Mac";
        if (/Linux/i.test(ua)) return "Linux";
        return "Unknown";
    }

    // ---------------------------
    // Step 1: UTM Redirect
    // ---------------------------
    const url = new URL(window.location.href);
    const params = url.searchParams;

    const defaultUTMs = {
        utm_source: "website",
        utm_medium: "direct",
        utm_campaign: "default"
    };

    let shouldRedirect = false;

    Object.entries(defaultUTMs).forEach(([k, v]) => {
        if (!params.has(k)) {
            params.set(k, v);
            shouldRedirect = true;
        } else {
            // check if changed
            const saved = getCookie(k);
            if (saved && saved !== params.get(k)) {
                params.set(k, v); // reset to default
                shouldRedirect = true;
            }
            setCookie(k, params.get(k), 7); // store UTM for 7 days
        }
    });

    if (shouldRedirect) {
        window.location.replace(url.toString());
        return; // stop execution, page will reload
    }

    // ---------------------------
    // Step 2: Tracking
    // ---------------------------
    let pid = getCookie("PID") || uuid();
    setCookie("PID", pid, 30);

    let siteBucket = getCookie("re_ret_site") || Math.floor(Math.random() * 10000);
    setCookie("re_ret_site", siteBucket, 30);

    let pageCount = parseInt(getCookie("re_ret_page") || "0") + 1;
    setCookie("re_ret_page", pageCount, 1);

    const payload = {
        pid: pid,
        page: window.location.href,
        referrer: document.referrer || "direct",
        device: detectDevice(),
        userAgent: navigator.userAgent,
        pageCount: pageCount,
        siteBucket: siteBucket,
        timestamp: new Date().toISOString(),
        utms: {
            utm_source: params.get("utm_source"),
            utm_medium: params.get("utm_medium"),
            utm_campaign: params.get("utm_campaign")
        }
    };

    // ---------------------------
    // Step 3: Send to API
    // ---------------------------
    fetch("https://yourdomain.com/api/trackAdvanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).catch(err => console.error("Tracking failed", err));

})();
