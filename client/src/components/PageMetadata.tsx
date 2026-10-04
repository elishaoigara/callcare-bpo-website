import { useEffect } from "react";
import { useLocation } from "wouter";
import { getPageDetails, siteOrigin } from "@/data/site-pages";

export default function PageMetadata() {
  const [location] = useLocation();
  useEffect(() => {
    const path = location.replace(/\/$/, "") || "/";
    const page = getPageDetails(path);
    document.title = page.title;
    const meta = (name: string, content: string, property = false) => {
      const attribute = property ? "property" : "name";
      let tag = document.head.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${name}"]`
      );
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    meta("description", page.description);
    meta(
      "robots",
      page.noindex ||
        !["www.callcarebpo.com", "callcarebpo.com"].includes(
          window.location.hostname
        )
        ? "noindex, nofollow"
        : "index, follow"
    );
    meta("og:title", page.title, true);
    meta("og:description", page.description, true);
    meta("og:url", `${siteOrigin}${path === "/" ? "" : path}`, true);
    meta("og:type", "website", true);
    meta("og:site_name", "CallCare BPO", true);
    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${siteOrigin}${path === "/" ? "" : path}`;
    if (window.location.hash) {
      try {
        document
          .getElementById(decodeURIComponent(window.location.hash.slice(1)))
          ?.scrollIntoView();
      } catch {
        /* Ignore malformed fragments. */
      }
    } else window.scrollTo(0, 0);
  }, [location]);
  return null;
}
