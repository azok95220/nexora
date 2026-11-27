#!/usr/bin/env node
/*
 * live_check.mjs — test complet en navigateur réel avec Playwright.
 *
 * Pour chaque URL :
 *   1. session neuve, chargement sans rien accepter → cookies (y compris HttpOnly),
 *      requêtes tierces, sonde browser_probe.js
 *   2. clic sur « Refuser » s'il est trouvé → cookies et requêtes après refus
 *   3. test clavier : 40 appuis sur Tab, focus visible ou non
 *   4. (option --axe) audit axe-core WCAG 2.1 AA
 *   5. capture d'écran
 *
 * Installation (une fois, dans un dossier séparé du projet si besoin) :
 *   npm i -D playwright && npx playwright install chromium
 *   (option --axe : npm i -D @axe-core/playwright)
 *
 * Usage :
 *   node live_check.mjs <url> [url2 …] [--out dossier] [--axe]
 *
 * N'utiliser que sur le site de l'utilisateur (local de préférence).
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const urls = args.filter((a) => /^https?:\/\//.test(a));
const outIdx = args.indexOf("--out");
const outDir = outIdx >= 0 ? args[outIdx + 1] : "conformite-tests";
const withAxe = args.includes("--axe");

if (!urls.length) {
  console.error("Usage : node live_check.mjs <url> [url2 …] [--out dossier] [--axe]");
  process.exit(1);
}

let chromium;
try {
  // Chercher Playwright dans le projet courant d'abord (le script vit dans le dossier du skill)
  const { createRequire } = await import("node:module");
  const { pathToFileURL } = await import("node:url");
  let mod;
  try { mod = await import(pathToFileURL(createRequire(join(process.cwd(), "noop.js")).resolve("playwright")).href); }
  catch { mod = await import("playwright"); }
  ({ chromium } = mod.default && mod.default.chromium ? mod.default : mod);
} catch {
  console.error("Playwright n'est pas installé. Lancez : npm i -D playwright && npx playwright install chromium");
  process.exit(2);
}

const probe = readFileSync(join(here, "browser_probe.js"), "utf8");
mkdirSync(outDir, { recursive: true });

const REFUSE = /tout refuser|refuser|continuer sans accepter|reject all|reject|decline|deny/i;
const AD_OR_ANALYTICS = /google-analytics|googletagmanager\.com\/gtag|analytics\.google|doubleclick|googleadservices|googlesyndication|facebook\.(net|com\/tr)|tiktok|licdn|hotjar|clarity\.ms|criteo|taboola|outbrain|fullstory|mouseflow|pinimg|ads-twitter|sc-static|youtube\.com\/embed|maps\.googleapis/i;

function thirdPartyOf(requests, pageUrl) {
  const host = new URL(pageUrl).hostname.replace(/^www\./, "");
  return [...new Set(requests
    .map((u) => { try { return new URL(u); } catch { return null; } })
    .filter((u) => u && /^https?:/.test(u.protocol))
    .map((u) => u.hostname)
    .filter((h) => { h = h.replace(/^www\./, ""); return !(h === host || h.endsWith("." + host)); }))];
}

const browser = await chromium.launch();
const report = [];

const CHALLENGE_SRC = String.raw`(Vercel Security Checkpoint|Just a moment\.\.\.|Attention Required! \| Cloudflare|cf-chl-|challenge-platform|Checking your browser|DDoS protection by|_Incapsula_Resource|px-captcha|perimeterx)`;

for (const url of urls) {
  const context = await browser.newContext({ locale: "fr-FR" });
  const page = await context.newPage();
  const requests = [];
  page.on("request", (r) => requests.push(r.url()));

  const entry = { url };
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  } catch (e) {
    await page.waitForTimeout(3000);
    entry.avertissement = `Chargement incomplet : ${e.message.split("\n")[0]}`;
    // Page jamais chargée (serveur arrêté, DNS, certificat) : aucun résultat n'est fiable
    if (/ERR_(CONNECTION|NAME_NOT_RESOLVED|ADDRESS|CERT|SSL)|net::ERR_/.test(e.message)) {
      entry.inaccessible = true;
      report.push(entry);
      await context.close();
      continue;
    }
  }
  await page.waitForTimeout(1500);

  // Page de protection anti-robots (Vercel, Cloudflare…) : on n'analyse pas la page de contrôle à la place du site
  const blocked = await page.evaluate((rx) => new RegExp(rx, "i").test(document.title + " " + document.documentElement.outerHTML.slice(0, 20000)), CHALLENGE_SRC).catch(() => false);
  if (blocked) {
    entry.bloque_anti_robots = true;
    await page.screenshot({ path: join(outDir, `${report.length + 1}-bloque.png`), fullPage: false }).catch(() => {});
    report.push(entry);
    await context.close();
    continue;
  }

  // 1. Avant consentement
  const cookiesBefore = await context.cookies();
  entry.avant_consentement = {
    cookies: cookiesBefore.map((c) => ({ nom: c.name, domaine: c.domain, httpOnly: c.httpOnly, secure: c.secure, sameSite: c.sameSite, expire_jours: c.expires > 0 ? Math.round((c.expires * 1000 - Date.now()) / 86400000) : "session" })),
    domaines_tiers: thirdPartyOf(requests, url),
    requetes_traceurs: [...new Set(requests.filter((u) => AD_OR_ANALYTICS.test(u)).map((u) => u.slice(0, 120)))],
    sonde: await page.evaluate(probe).catch((e) => ({ erreur: e.message })),
  };
  await page.screenshot({ path: join(outDir, `${report.length + 1}-avant.png`), fullPage: false });

  // 2. Refus
  const before = requests.length;
  const refuseBtn = page.getByRole("button", { name: REFUSE }).or(page.getByRole("link", { name: REFUSE })).first();
  if (await refuseBtn.count()) {
    await refuseBtn.click().catch(() => {});
    await page.waitForTimeout(2000);
    await page.reload({ waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(1500);
    const after = requests.slice(before);
    const cookiesAfter = await context.cookies();
    entry.apres_refus = {
      bouton_refuser_trouve: true,
      cookies: cookiesAfter.map((c) => c.name),
      nouveaux_cookies: cookiesAfter.map((c) => c.name).filter((n) => !cookiesBefore.some((c) => c.name === n)),
      requetes_traceurs: [...new Set(after.filter((u) => AD_OR_ANALYTICS.test(u)).map((u) => u.slice(0, 120)))],
      bandeau_reaffiche: await page.getByRole("button", { name: REFUSE }).first().isVisible().catch(() => false),
    };
  } else {
    // Sans cookie ni traceur, aucun consentement n'est à recueillir : l'absence de bouton n'est pas un défaut
    const rienARefuser = cookiesBefore.length === 0 && entry.avant_consentement.requetes_traceurs.length === 0;
    entry.apres_refus = { bouton_refuser_trouve: false, sans_objet: rienARefuser };
  }

  // 3. Clavier
  const steps = [];
  let devtoolSeen = false;
  await page.keyboard.press("Escape").catch(() => {});
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const s = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      // Outils de développement (Next.js, Vite, Astro, Nuxt…) : absents en production, à ignorer
      const DEV = /^(nextjs-portal|vite-error-overlay|astro-dev-toolbar|nuxt-devtools|vue-devtools|react-devtools|svelte-inspector)/i;
      if (DEV.test(el.tagName) || /^__next|^__nuxt-devtools|^astro-dev/.test(el.id || "")) return { devtool: true };
      const cs = getComputedStyle(el);
      const visibleFocus = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== "none");
      const r = el.getBoundingClientRect();
      return { element: el.tagName.toLowerCase() + (el.id ? "#" + el.id : ""), texte: (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 40), focus_visible: visibleFocus, hors_ecran: r.bottom < 0 || r.top > innerHeight * 3 };
    });
    if (!s) continue;
    if (s.devtool) { devtoolSeen = true; continue; }
    steps.push(s);
    if (steps.length > 3 && steps.slice(-3).every((x) => x.element === s.element && x.texte === s.texte)) break;
  }
  entry.clavier = {
    elements_atteints: steps.length,
    sans_focus_visible: steps.filter((s) => !s.focus_visible).map((s) => `${s.element} « ${s.texte} »`).slice(0, 20),
    piege_possible: steps.length > 5 && new Set(steps.slice(-6).map((s) => s.element + s.texte)).size <= 2,
  };
  // Serveur de développement : les en-têtes et scripts diffèrent de la production
  entry.serveur_dev = devtoolSeen || await page.evaluate(() => !!document.querySelector("nextjs-portal, vite-error-overlay, astro-dev-toolbar, script[src*='/@vite/client'], script[src*='webpack-hmr']")).catch(() => false);

  // 4. axe-core
  if (withAxe) {
    try {
      const { createRequire } = await import("node:module");
      const { pathToFileURL } = await import("node:url");
      let axeMod;
      try { axeMod = await import(pathToFileURL(createRequire(join(process.cwd(), "noop.js")).resolve("@axe-core/playwright")).href); }
      catch { axeMod = await import("@axe-core/playwright"); }
      const AxeBuilder = axeMod.default?.default || axeMod.default || axeMod.AxeBuilder;
      const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      entry.axe = res.violations.map((v) => ({ regle: v.id, impact: v.impact, description: v.help, occurrences: v.nodes.length, exemple: v.nodes[0]?.target?.join(" ") }));
    } catch (e) {
      entry.axe = { erreur: "Installer @axe-core/playwright dans le même dossier que Playwright (npm i -D @axe-core/playwright), puis relancer depuis ce dossier" };
    }
  }

  await page.screenshot({ path: join(outDir, `${report.length + 1}-apres.png`), fullPage: false });
  report.push(entry);
  await context.close();
}

await browser.close();
const outFile = join(outDir, "live-check.json");
writeFileSync(outFile, JSON.stringify(report, null, 2));

// Résumé lisible
for (const e of report) {
  const av = e.avant_consentement;
  console.log(`\n# ${e.url}`);
  if (e.inaccessible) { console.log(`❓ Page inaccessible, aucun test réalisé : ${e.avertissement}`); continue; }
  if (e.bloque_anti_robots) { console.log("❓ Page bloquée par une protection anti-robots (Vercel Security Checkpoint, Cloudflare…) : aucun test réalisé. Tester la version de production en local (build + start)."); continue; }
  if (e.avertissement) console.log(`⚠️ ${e.avertissement}`);
  console.log(`Cookies avant consentement : ${av.cookies.map((c) => c.nom).join(", ") || "aucun"}`);
  console.log(`Requêtes vers des traceurs avant consentement : ${av.requetes_traceurs.length ? "🔴 " + av.requetes_traceurs.length : "✅ aucune"}`);
  console.log(`Bouton Refuser : ${e.apres_refus.bouton_refuser_trouve ? "trouvé" : e.apres_refus.sans_objet ? "➖ sans objet (aucun cookie ni traceur à refuser)" : "🔴 introuvable"}`);
  if (e.apres_refus.bouton_refuser_trouve) console.log(`Traceurs après refus : ${e.apres_refus.requetes_traceurs.length ? "🔴 " + e.apres_refus.requetes_traceurs.length : "✅ aucun"}`);
  console.log(`Clavier : ${e.clavier.elements_atteints} éléments, ${e.clavier.sans_focus_visible.length} sans focus visible${e.clavier.piege_possible ? ", 🔴 piège possible" : ""}`);
  if (Array.isArray(e.axe)) console.log(`axe : ${e.axe.length} règles en échec`);
  else if (e.axe?.erreur) console.log(`axe : ⚠️ ${e.axe.erreur}`);
  if (e.serveur_dev) console.log("⚠️ Serveur de développement détecté : refaire les tests d'en-têtes et de scripts sur la version de production (build + start)");
}
console.log(`\nRapport complet : ${outFile}`);
