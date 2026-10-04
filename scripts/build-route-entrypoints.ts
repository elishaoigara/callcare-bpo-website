import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  pageDetails,
  missingPage,
  siteOrigin,
  type PageDetails,
} from "../client/src/data/site-pages.ts";

const template = await readFile("dist/public/index.html", "utf8");
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    character =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!
  );
function entrypoint(path: string, page: PageDetails) {
  const canonical = `${siteOrigin}${path === "/" ? "" : path}`;
  return template
    .replace(/<title>.*?<\/title>/s, `<title>${escape(page.title)}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escape(page.description)}" />`
    )
    .replace(
      "</head>",
      `<link rel="canonical" href="${escape(canonical)}" />
    <meta name="robots" content="${page.noindex || process.env.VERCEL_ENV === "preview" ? "noindex, nofollow" : "index, follow"}" />
    <meta property="og:title" content="${escape(page.title)}" />
    <meta property="og:description" content="${escape(page.description)}" />
    <meta property="og:url" content="${escape(canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="CallCare BPO" />
  </head>`
    );
}
for (const [route, page] of Object.entries(pageDetails)) {
  const directory = `dist/public${route === "/" ? "" : route}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/index.html`, entrypoint(route, page));
}
await writeFile("dist/public/404.html", entrypoint("/404", missingPage));
// Keep crawlable pages in sync with the routes, including every public talent pool.
const locations = Object.entries(pageDetails)
  .filter(([, page]) => !page.noindex)
  .map(
    ([route]) =>
      `<url><loc>${siteOrigin}${route === "/" ? "/" : route}</loc></url>`
  )
  .join("\n  ");
await writeFile(
  "dist/public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${locations}\n</urlset>\n`
);
