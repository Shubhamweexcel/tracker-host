<script>
(function() {
    const ENDPOINT = " https://flea-saved-dory.ngrok-free.app/track"; // <-- your backend API

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
    }

    function setCookie(name, value, days = 365) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const uid = getCookie("tracker_uid") || generateUUID();
    setCookie("tracker_uid", uid);

    const pageCount = parseInt(getCookie("tracker_page_count") || "0") + 1;
    setCookie("tracker_page_count", pageCount);

    const payload = {
        uid: uid,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        device: getDeviceType(),
        pageCount: pageCount,
        timestamp: new Date().toISOString(),
    };

    function getDeviceType() {
        const ua = navigator.userAgent;
        if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
        if (/Android/i.test(ua)) return "Android";
        if (/Windows NT/i.test(ua)) return "Windows";
        if (/Macintosh/i.test(ua)) return "Mac";
        if (/Linux/i.test(ua)) return "Linux";
        return "Unknown";
    }

    fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).catch((err) => console.error("Tracking failed", err));

})();
</script>
