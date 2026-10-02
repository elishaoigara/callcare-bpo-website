import { copyFile, mkdir } from "node:fs/promises";
import { jobs } from "../client/src/data/careers.ts";
const routes = [
  "careers",
  "operations",
  "terms",
  "privacy",
  "recruitment-preview",
  ...jobs
    .filter(job => job.status === "open")
    .map(job => `careers/jobs/${job.slug}`),
];
for (const route of routes) {
  const directory = `dist/public/${route}`;
  await mkdir(directory, { recursive: true });
  await copyFile("dist/public/index.html", `${directory}/index.html`);
}
