(function () {
    const API = "https://thoroughly-definite-bee.ngrok-free.app/abhiTrack"; // <-- backend

    const currentUrl = window.location.href.split("?")[0]; // base URL without query params
    const deviceType = getDeviceType();
    const userAgent = navigator.userAgent;
    const referrer = document.referrer;

    function getCookie(name) {
        return document.cookie.split("; ").reduce((acc, part) => {
            const [key, value] = part.split("=");
            return key === encodeURIComponent(name) ? decodeURIComponent(value) : acc;
        }, null);
    }

    function setCookie(name, value) {
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${new Date(Date.now() + 864e5).toUTCString()}; path=/`;
    }

    const pid = getCookie("PID") || generateUUID();
    const aid = getCookie("AID") || encodeURIComponent(referrer);
    const siteId = getCookie("re_ret_site") || Math.floor(Math.random() * 100 + 1);
    const pageCount = parseInt(getCookie("re_ret_page") || "0") + 1;

    setCookie("PID", pid);
    setCookie("AID", aid);
    setCookie("re_ret_site", siteId);
    setCookie("re_ret_page", pageCount);

    function getDeviceType() {
        const ua = navigator.userAgent;
        if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
        if (/Android/i.test(ua)) return "Android";
        if (/Windows Phone/i.test(ua)) return "Windows Phone";
        if (/Windows NT/i.test(ua)) return "Windows";
        if (/Macintosh/i.test(ua)) return "Mac";
        if (/Linux/i.test(ua)) return "Linux";
        return "Unknown";
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                  v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const data = {
        event: "viewPage",
        uxid: generateUUID(),
        page: currentUrl,
        device_type: deviceType,
        uAgent: userAgent,
        referrer: aid,
        origin: window.location.hostname,
        pageCount: pageCount,
        siteId: siteId
    };

    fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(resp => resp.json())
    .then(resp => {
        if (resp.status === "ok") {
            // Build UTM URL automatically
            const params = new URLSearchParams({
                utm_source: resp.utm_source,
                utm_medium: resp.utm_medium,
                utm_campaign: resp.utm_campaign
            });

            // Redirect user to the same path but with UTM
            const newUrl = currentUrl + "?" + params.toString();

            if (window.location.href !== newUrl) {
                window.location.replace(newUrl);
            }
        }
    })
    .catch(err => console.error("Tracking failed:", err));
})();
