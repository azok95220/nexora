import { site, icons, metiers, scenarios } from "./data.mjs";

export const waDirect = `${site.whatsapp}?text=${encodeURIComponent("Bonjour Nexora Travaux, je souhaite un devis gratuit pour mon projet.")}`;

export const icon = (name, cls = "icon") =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Découpe un titre en mots animables (le texte reste lisible sans JS et par les lecteurs d’écran). */
//  Syntaxe : « | » = retour à la ligne, *mots* = mots mis en couleur.
export const split = (text) => {
  let accent = false;
  let i = 0;
  return text
    .split("|")
    .map((line) =>
      line
        .trim()
        .split(/\s+/)
        .map((w) => {
          if (w.startsWith("*")) { accent = true; w = w.slice(1); }
          const end = w.endsWith("*");
          if (end) w = w.slice(0, -1);
          const out = `<span class="w"><span class="${accent ? "accent" : ""}" style="--i:${i++}">${w}</span></span>`;
          if (end) accent = false;
          return out;
        })
        .join(" ")
    )
    .join(" <br>");
};

const brand = `<a class="brand" href="/" aria-label="${site.name}, accueil">
  <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M9 24V8h3l8 10.6V8h3v16h-2.9L12 13.3V24z"/></svg></span>
  <span class="brand-text">NEXORA <span>TRAVAUX</span></span>
</a>`;

function header(current) {
  const link = (href, label, key) =>
    `<a href="${href}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<header class="site-header">
  <div class="header-inner">
    ${brand}
    <nav class="nav" id="nav" aria-label="Navigation principale">
      ${link("/#metiers", "Métiers", "metiers")}
      ${link("/#methode", "Méthode", "methode")}
      ${link("/#mickael", "Qui suis-je", "mickael")}
      ${link("/zone-intervention/", "Zone", "zone")}
      ${link("/parrainage/", "Parrainage", "parrainage")}
      <a class="nav-phone" href="tel:${site.phone}">${icon("phone")}${site.phoneDisplay}</a>
      <a class="btn btn-light btn-sm magnetic" href="/devis/" data-to-form>Devis gratuit ${icon("arrow")}</a>
    </nav>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav" aria-label="Ouvrir le menu">
      <span></span><span></span>
    </button>
  </div>
  <div class="scroll-progress" aria-hidden="true"><span></span></div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <p class="footer-name">${site.name}</p>
      <p>Un seul contact pour vos travaux, à Paris et en Île-de-France.</p>
      <a class="footer-link" href="tel:${site.phone}">${icon("phone")}${site.phoneDisplay}</a>
      <a class="footer-link" href="mailto:${site.email}">${icon("mail")}${site.email}</a>
      <a class="btn btn-whatsapp btn-sm footer-cta-btn" href="/devis/" data-to-form>Devis gratuit ${icon("arrow")}</a>
    </div>
    <nav aria-label="Nos métiers">
      <h2 class="footer-title">Métiers</h2>
      <ul class="footer-cols">${metiers.map((m) => `<li><a href="/metiers/${m.slug}/">${m.name}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="Informations">
      <h2 class="footer-title">Informations</h2>
      <ul>
        <li><a href="/zone-intervention/">Zone d’intervention</a></li>
        <li><a href="/parrainage/">Parrainage</a></li>
        <li><a href="/mentions-legales/">Mentions légales</a></li>
        <li><a href="/confidentialite/">Confidentialité</a></li>
      </ul>
    </nav>
  </div>
  <div class="container footer-bottom">
    <span>© ${new Date().getFullYear()} ${site.name}</span>
    <span>Paris &amp; toute l’Île-de-France</span>
  </div>
</footer>
<div class="mobile-bar" aria-label="Contact rapide">
  <a class="btn btn-glass" href="tel:${site.phone}">${icon("phone")}Appeler</a>
  <a class="btn btn-whatsapp" href="${waDirect}" rel="noopener">${icon("whatsapp")}Devis WhatsApp</a>
</div>
<a class="wa-float magnetic" href="${waDirect}" rel="noopener" aria-label="Nous écrire sur WhatsApp">
  ${icon("whatsapp")}<span>Devis gratuit</span>
</a>`;
}

/**
 * @param {{path:string,title:string,description:string,body:string,current?:string,jsonld?:object[],noindex?:boolean,preloadHero?:boolean,theme?:string}} p
 */
export function page(p) {
  const canonical = site.url + p.path;
  const ld = (p.jsonld || [])
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join("\n");
  const cls = [p.preloadHero ? "has-hero" : "", p.theme === "dark" ? "top-dark" : ""].filter(Boolean).join(" ");
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
${p.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="#060912">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}/assets/img/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="apple-mobile-web-app-title" content="Nexora">
<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
${p.preloadHero ? '<link rel="preload" as="image" href="/assets/img/hero-1200.webp" imagesrcset="/assets/img/hero-800.webp 800w, /assets/img/hero-1200.webp 1200w, /assets/img/hero-1600.webp 1600w" imagesizes="100vw" fetchpriority="high">' : ""}
<link rel="stylesheet" href="/assets/css/site.css?v=__V__">
${ld}
</head>
<body${cls ? ` class="${cls}"` : ""}>
<a class="skip-link" href="#contenu">Aller au contenu</a>
${header(p.current)}
<main id="contenu">
${p.body}
</main>
${footer()}
${quoteSheet()}
<script src="/assets/js/site.js?v=__V__" defer></script>
</body>
</html>
`;
}

/** Bloc « fil d’Ariane » + données structurées associées */
export function breadcrumb(items) {
  const html = `<nav class="breadcrumb" aria-label="Fil d’Ariane"><ol>${items
    .map((it, i) =>
      i === items.length - 1
        ? `<li aria-current="page">${it[0]}</li>`
        : `<li><a href="${it[1]}">${it[0]}</a></li>`
    )
    .join("")}</ol></nav>`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it[0],
      item: site.url + it[1],
    })),
  };
  return { html, ld };
}

export const businessLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": site.url + "/#entreprise",
  name: site.name,
  url: site.url + "/",
  telephone: site.phone,
  email: site.email,
  image: site.url + "/assets/img/og-image.jpg",
  description: site.description,
  areaServed: [
    { "@type": "AdministrativeArea", name: "Île-de-France" },
    { "@type": "City", name: "Paris" },
  ],
  knowsAbout: metiers.map((m) => m.name),
  founder: { "@type": "Person", name: "Mikhael" },
};

export function faqLd(pairs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function faqHtml(pairs) {
  return `<div class="faq">${pairs
    .map(
      ([q, a], i) =>
        `<details class="reveal"><summary><span class="faq-n">${String(i + 1).padStart(2, "0")}</span><span class="faq-q">${q}</span><span class="faq-icon" aria-hidden="true"></span></summary><div class="faq-a"><p>${a}</p></div></details>`
    )
    .join("")}</div>`;
}

/** Formulaire de demande en 3 étapes (accueil + page devis).
 *  Sans JavaScript, les 3 étapes s’affichent simplement les unes sous les autres. */
export function quoteForm(id = "devis-form") {
  const tile = (value, slug, ic) =>
    `<label class="tile"><input type="checkbox" name="metiers" value="${value}" data-metier="${slug}"><span>${icon(ic, "icon tile-icon")}${value}${icon("check", "icon tile-check")}</span></label>`;
  return `<form class="quote-form" id="${id}" novalidate data-quote-form>
  <div class="form-progress" aria-hidden="true">
    <span class="form-progress-label">Étape <b data-step-num>1</b>/2</span>
    <span class="form-progress-bar"><span data-step-bar></span></span>
  </div>

  <fieldset class="form-step" data-step="1">
    <legend class="step-title">Quels travaux envisagez-vous ?</legend>
    <div class="picks" role="group" aria-label="Projets types">
      ${scenarios.map((sc) => `<button type="button" class="pick" data-pick="${sc.metiers.join(",")}" aria-pressed="false">${sc.name}</button>`).join("")}
    </div>
    <p class="step-hint">Choisissez un projet type ci-dessus, ou touchez un ou plusieurs métiers.</p>
    <div class="tiles">
      ${metiers.map((m) => tile(m.name, m.slug, m.slug)).join("")}
      ${tile("Autre / je ne sais pas encore", "autre", "chat")}
    </div>
    <p class="form-error" role="alert" hidden></p>
    <div class="step-nav"><button class="btn btn-primary btn-lg" type="button" data-next>Suivant ${icon("arrow")}</button></div>
  </fieldset>

  <div class="form-step" data-step="2">
    <p class="step-title">Presque fini : vos coordonnées</p>
    <p class="step-selection" data-selection hidden></p>
    <div class="field-row">
      <div class="field">
        <label for="${id}-name">Votre nom</label>
        <input id="${id}-name" name="name" autocomplete="name" placeholder="Prénom et nom" required>
      </div>
      <div class="field">
        <label for="${id}-cp">Code postal</label>
        <input id="${id}-cp" name="postalCode" inputmode="numeric" autocomplete="postal-code" placeholder="Ex. 75011" pattern="[0-9]{5}" maxlength="5" required>
      </div>
    </div>
    <div class="field">
      <label for="${id}-project">Votre projet en quelques mots <span class="optional">facultatif</span></label>
      <textarea id="${id}-project" name="project" rows="2" placeholder="Ex. : salle de bain de 6 m², pour le printemps."></textarea>
    </div>
    <p class="form-error" role="alert" hidden></p>
    <div class="form-actions">
      <button class="btn btn-whatsapp btn-lg" type="submit" data-channel="whatsapp">${icon("whatsapp")}Envoyer sur WhatsApp</button>
      <div class="form-alt">
        <button class="btn btn-outline" type="submit" data-channel="sms">${icon("sms")}SMS</button>
        <button class="btn btn-outline" type="submit" data-channel="email">${icon("mail")}E-mail</button>
      </div>
    </div>
    <div class="step-nav step-nav-start"><button class="btn btn-text" type="button" data-prev>${icon("arrow", "icon ba-l")}Modifier les travaux</button></div>
  </div>

  <p class="form-note">${icon("shield")}<span><strong>Gratuit et sans engagement.</strong> <span class="note-more">Vous relisez votre message avant de l’envoyer. Ou appelez le <a href="tel:${site.phone}">${site.phoneDisplay}</a>.</span></span></p>
</form>`;
}

/** Panneau de devis ouvert par-dessus la page (présent sur toutes les pages) */
export const quoteSheet = () => `<dialog class="sheet" id="quote-sheet" aria-labelledby="sheet-title">
  <div class="sheet-head">
    <p id="sheet-title" class="sheet-title">${icon("spark")}Devis gratuit</p>
    <button class="sheet-close" type="button" data-sheet-close aria-label="Fermer">${icon("close")}</button>
  </div>
  <div class="sheet-body">${quoteForm("sheet-form")}</div>
</dialog>`;
