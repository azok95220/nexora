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

// Compression légère du CSS (commentaires et blancs inutiles)
const cssPath = join(out, "assets/css/site.css");
const css = (await readFile(cssPath, "utf8"))
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s*\n\s*/g, "")
  .replace(/\s*([{};])\s*/g, "$1")
  .replace(/;}/g, "}")
  .replace(/([a-z-]):\s+/g, "$1:");
await writeFile(cssPath, css);

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
  // Typographie française : espaces insécables avant ? ! ; : et à l’intérieur des « guillemets »
  const typo = html
    .replace(/ ([?!;])/g, "\u202f$1")
    .replace(/ :(\s)/g, "\u00a0:$1")
    .replace(/« /g, "«\u00a0")
    .replace(/ »/g, "\u00a0»");
  await writeFile(dest, typo.replaceAll("__V__", hash));
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
