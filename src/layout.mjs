import { site, icons, metiers } from "./data.mjs";

export const icon = (name, cls = "icon") =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const brand = `<a class="brand" href="/" aria-label="${site.name}, accueil">
  <span class="brand-mark" aria-hidden="true">N</span>
  <span class="brand-text">NEXORA<span>TRAVAUX</span></span>
</a>`;

function header(current) {
  const link = (href, label, key) =>
    `<a href="${href}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<header class="site-header">
  <div class="container header-inner">
    ${brand}
    <nav class="nav" id="nav" aria-label="Navigation principale">
      ${link("/#metiers", "Nos métiers", "metiers")}
      ${link("/#methode", "Comment ça marche", "methode")}
      ${link("/zone-intervention/", "Zone d’intervention", "zone")}
      <a class="nav-phone" href="tel:${site.phone}">${icon("phone")}${site.phoneDisplay}</a>
      <a class="btn btn-primary btn-sm" href="/devis/">Demander un devis</a>
    </nav>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav" aria-label="Ouvrir le menu">
      ${icon("menu", "icon icon-open")}${icon("close", "icon icon-close")}
    </button>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      ${brand}
      <p>${site.tagline}. Un seul contact pour coordonner les bons professionnels de votre rénovation.</p>
      <a class="footer-phone" href="tel:${site.phone}">${icon("phone")}${site.phoneDisplay}</a>
      <a class="footer-phone footer-mail" href="mailto:${site.email}">${icon("mail")}${site.email}</a>
    </div>
    <div>
      <h2 class="footer-title">Nos métiers</h2>
      <ul>${metiers.map((m) => `<li><a href="/metiers/${m.slug}/">${m.name}</a></li>`).join("")}</ul>
    </div>
    <div>
      <h2 class="footer-title">Zone d’intervention</h2>
      <ul>
        <li><a href="/zone-intervention/">Île-de-France</a></li>
        <li><a href="/zone-intervention/#limitrophes">Oise (60)</a></li>
        <li><a href="/zone-intervention/#limitrophes">Eure (27)</a></li>
      </ul>
      <h2 class="footer-title">Informations</h2>
      <ul>
        <li><a href="/devis/">Demander un devis</a></li>
        <li><a href="/mentions-legales/">Mentions légales</a></li>
        <li><a href="/confidentialite/">Confidentialité</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <span>© ${new Date().getFullYear()} ${site.name}</span>
    <span>Île-de-France · Oise · Eure</span>
  </div>
</footer>
<div class="mobile-bar" aria-label="Contact rapide">
  <a class="btn btn-ghost" href="tel:${site.phone}">${icon("phone")}Appeler</a>
  <a class="btn btn-primary" href="/devis/">${icon("file")}Demander un devis</a>
</div>`;
}

/**
 * @param {{path:string,title:string,description:string,body:string,current?:string,jsonld?:object[],noindex?:boolean,preloadHero?:boolean}} p
 */
export function page(p) {
  const canonical = site.url + p.path;
  const ld = (p.jsonld || [])
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join("\n");
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
${p.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="#0E1A2B">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}/assets/img/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/bricolage.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
${p.preloadHero ? '<link rel="preload" as="image" href="/assets/img/hero-1200.webp" imagesrcset="/assets/img/hero-800.webp 800w, /assets/img/hero-1200.webp 1200w, /assets/img/hero-1600.webp 1600w" imagesizes="(min-width: 960px) 50vw, 100vw" fetchpriority="high">' : ""}
<link rel="stylesheet" href="/assets/css/site.css?v=__V__">
${ld}
</head>
<body>
<a class="skip-link" href="#contenu">Aller au contenu</a>
${header(p.current)}
<main id="contenu">
${p.body}
</main>
${footer()}
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
    { "@type": "AdministrativeArea", name: "Oise" },
    { "@type": "AdministrativeArea", name: "Eure" },
  ],
  knowsAbout: metiers.map((m) => m.name),
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
      ([q, a]) =>
        `<details><summary>${q}${icon("plus", "icon faq-icon")}</summary><p>${a}</p></details>`
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
    <span class="form-progress-label">Étape <b data-step-num>1</b> sur 3</span>
    <span class="form-progress-bar"><span data-step-bar></span></span>
  </div>

  <fieldset class="form-step" data-step="1">
    <legend class="step-title">Quels travaux envisagez-vous ?</legend>
    <p class="step-hint">Touchez un ou plusieurs métiers.</p>
    <div class="tiles">
      ${metiers.map((m) => tile(m.name, m.slug, m.slug)).join("")}
      ${tile("Autre / je ne sais pas encore", "autre", "chat")}
    </div>
    <p class="form-error" role="alert" hidden></p>
    <div class="step-nav"><button class="btn btn-primary btn-lg" type="button" data-next>Suivant ${icon("arrow")}</button></div>
  </fieldset>

  <div class="form-step" data-step="2">
    <label class="step-title" for="${id}-project">Décrivez votre projet <span class="optional">facultatif</span></label>
    <p class="step-hint">Pièces concernées, surfaces, délais… Vous pourrez ajouter des photos directement dans WhatsApp.</p>
    <div class="field">
      <textarea id="${id}-project" name="project" rows="5" placeholder="Ex. : rénovation de la salle de bain, environ 6 m², pour le printemps."></textarea>
    </div>
    <div class="step-nav">
      <button class="btn btn-text" type="button" data-prev>Retour</button>
      <button class="btn btn-primary btn-lg" type="button" data-next>Suivant ${icon("arrow")}</button>
    </div>
  </div>

  <div class="form-step" data-step="3">
    <p class="step-title">Pour vous recontacter</p>
    <div class="field-row">
      <div class="field">
        <label for="${id}-name">Votre nom</label>
        <input id="${id}-name" name="name" autocomplete="name" placeholder="Prénom et nom" required>
      </div>
      <div class="field">
        <label for="${id}-cp">Code postal</label>
        <input id="${id}-cp" name="postalCode" inputmode="numeric" autocomplete="postal-code" placeholder="Ex. 95220" pattern="[0-9]{5}" maxlength="5" required>
      </div>
    </div>
    <p class="form-error" role="alert" hidden></p>
    <div class="form-actions">
      <button class="btn btn-primary btn-lg" type="submit" data-channel="whatsapp">${icon("whatsapp")}Envoyer sur WhatsApp</button>
      <button class="btn btn-outline btn-lg" type="submit" data-channel="sms">${icon("sms")}Envoyer par SMS</button>
      <button class="btn btn-outline btn-lg" type="submit" data-channel="email">${icon("mail")}Envoyer par e-mail</button>
    </div>
    <div class="step-nav step-nav-start"><button class="btn btn-text" type="button" data-prev>Retour</button></div>
  </div>

  <p class="form-note">Demande sans engagement. Vous pourrez relire votre message avant de l’envoyer. Vous pouvez aussi nous appeler au <a href="tel:${site.phone}">${site.phoneDisplay}</a> ou écrire à <a href="mailto:${site.email}">${site.email}</a>.</p>
</form>`;
}
