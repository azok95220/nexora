// Génère le site statique dans dist/ : `node build.mjs`
import { mkdir, writeFile, cp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { allPages } from "./src/pages.mjs";
import { site } from "./src/data.mjs";

const out = "dist";
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp("src/assets", join(out, "assets"), { recursive: true });
await cp("src/static", out, { recursive: true });

// Version des fichiers CSS/JS pour forcer le rafraîchissement du cache après chaque modification
const hash = createHash("sha1")
  .update(await readFile("src/assets/css/site.css"))
  .update(await readFile("src/assets/js/site.js"))
  .digest("hex")
  .slice(0, 8);

const pages = allPages();
for (const [file, html] of pages) {
  const dest = join(out, file);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, html.replaceAll("__V__", hash));
}

const today = new Date().toISOString().slice(0, 10);
const urls = pages.filter((p) => p[2]);
await writeFile(
  join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([, , path, prio]) => `  <url><loc>${site.url}${path}</loc><lastmod>${today}</lastmod><priority>${prio}</priority></url>`).join("\n")}
</urlset>
`
);
await writeFile(join(out, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

console.log(`✓ ${pages.length} pages générées dans ${out}/`);
