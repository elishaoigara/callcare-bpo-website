/** Optional analytics must not issue malformed requests when settings are absent. */
export function analyticsUrl(endpoint?: string, websiteId?: string) {
  if (!endpoint?.trim() || !websiteId?.trim()) return null;
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    url.pathname = `${url.pathname.replace(/\/$/, "")}/umami`;
    url.search = "";
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

export function initializeAnalytics() {
  if (
    ["/orders", "/billing"].includes(
      window.location.pathname.replace(/\/$/, "")
    )
  )
    return;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
  const src = analyticsUrl(import.meta.env.VITE_ANALYTICS_ENDPOINT, websiteId);
  if (!src || document.getElementById("callcare-analytics")) return;
  const script = document.createElement("script");
  script.id = "callcare-analytics";
  script.defer = true;
  script.src = src;
  script.dataset.websiteId = websiteId.trim();
  document.head.appendChild(script);
}
