import { site, metiers, zones } from "./data.mjs";
import { page, icon, breadcrumb, businessLd, faqLd, faqHtml, quoteForm } from "./layout.mjs";

const homeFaq = [
  [
    "Qui réalise les travaux ?",
    "L’entreprise réalisatrice, choisie selon la nature de votre chantier. Elle chiffre les travaux et vous transmet directement une proposition détaillée. Nexora Travaux reste votre interlocuteur pour cadrer le besoin et organiser la visite.",
  ],
  [
    "Ma demande m’engage-t-elle à quelque chose ?",
    "Non. La demande est sans engagement : vos informations servent uniquement à étudier votre projet.",
  ],
  [
    "Puis-je regrouper plusieurs métiers dans une seule demande ?",
    "Oui, c’est tout l’intérêt : sélectionnez les métiers concernés (par exemple plomberie, carrelage et électricité pour une salle de bain) et décrivez votre projet en une seule fois.",
  ],
  [
    "Dans quelles zones intervenez-vous ?",
    "Nous étudions les projets dans toute l’Île-de-France (Paris et les sept départements franciliens), ainsi que dans l’Oise (60) et l’Eure (27).",
  ],
];

const steps = [
  ["chat", "Vous nous expliquez", "Type de travaux, adresse, photos et disponibilités : nous réunissons les informations utiles."],
  ["calendar", "Nous organisons la visite", "Un rendez-vous est fixé avec l’interlocuteur capable d’évaluer précisément votre chantier."],
  ["file", "Vous recevez votre devis", "L’entreprise réalisatrice chiffre les travaux et vous transmet une proposition détaillée."],
];

const methodSection = (headingTag = "h2") => `<section class="section section-ink" id="methode" aria-labelledby="methode-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow eyebrow-light">Notre méthode</p>
      <${headingTag} id="methode-title" class="h2">Simple du premier message jusqu’au démarrage.</${headingTag}>
    </div>
    <ol class="steps">
      ${steps
        .map(
          ([ic, t, d], i) => `<li class="step">
        <div class="step-top"><span class="step-num">0${i + 1}</span><span class="step-icon">${icon(ic)}</span></div>
        <h3>${t}</h3>
        <p>${d}</p>
      </li>`
        )
        .join("")}
    </ol>
  </div>
</section>`;

const zoneSummary = `<div class="zone-card">
  <div class="zone-main">
    <span class="zone-badge">Zone principale</span>
    <h3>Île-de-France</h3>
    <ul class="dept-list">
      ${zones.idf.departements.map(([n, name]) => `<li><span>${n}</span>${name}</li>`).join("")}
    </ul>
  </div>
  <div class="zone-side">
    <span class="zone-badge zone-badge-muted">Départements limitrophes</span>
    <ul class="dept-list dept-list-lg">
      ${zones.limitrophes.map(([n, name]) => `<li><span>${n}</span>${name}</li>`).join("")}
    </ul>
  </div>
</div>`;

const ctaBand = (title = "Un projet en tête ? Parlons-en.") => `<section class="cta-band">
  <div class="container cta-inner">
    <div>
      <h2 class="h3">${title}</h2>
      <p>Quelques informations suffisent pour préparer un premier échange efficace. Demande sans engagement.</p>
    </div>
    <div class="cta-actions">
      <a class="btn btn-primary btn-lg" href="/devis/">Demander un devis ${icon("arrow")}</a>
      <a class="btn btn-light btn-lg" href="tel:${site.phone}">${icon("phone")}${site.phoneDisplay}</a>
    </div>
  </div>
</section>`;

/* ------------------------------------------------------------------ */

function home() {
  const body = `
<section class="hero" id="top">
  <div class="container hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">${site.tagline}</p>
      <h1 class="display">Les bons professionnels. <span class="accent">Un seul contact.</span></h1>
      <p class="lead">Nous cadrons votre besoin, organisons la visite et vous mettons en relation avec les professionnels adaptés à votre chantier.</p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="#home-form">Parler de mon projet ${icon("arrow")}</a>
        <a class="btn btn-outline btn-lg" href="#metiers">Découvrir nos métiers</a>
      </div>
      <ul class="trust">
        <li>${icon("user")}Interlocuteur dédié</li>
        <li>${icon("shield")}Demande sans engagement</li>
        <li>${icon("pin")}3 zones couvertes</li>
      </ul>
    </div>
    <div class="hero-visual">
      <picture>
        <img src="/assets/img/hero-1200.webp" srcset="/assets/img/hero-800.webp 800w, /assets/img/hero-1200.webp 1200w, /assets/img/hero-1600.webp 1600w" sizes="(min-width: 960px) 50vw, 100vw" width="1600" height="900" alt="Professionnel étudiant les plans d’une rénovation dans un appartement lumineux" fetchpriority="high">
      </picture>
      <div class="hero-card" aria-hidden="true">
        <p class="hero-card-title">Votre projet</p>
        <ol>
          <li class="done">${icon("check")}Demande reçue</li>
          <li class="done">${icon("check")}Visite organisée</li>
          <li>${icon("file")}Devis détaillé</li>
        </ol>
      </div>
    </div>
  </div>
</section>

<section class="section" id="metiers" aria-labelledby="metiers-title">
  <div class="container">
    <div class="section-head section-head-split">
      <div>
        <p class="eyebrow">Nos métiers</p>
        <h2 id="metiers-title" class="h2">Un réseau pour chaque étape de votre rénovation.</h2>
      </div>
      <p class="section-intro">Un besoin précis ou plusieurs lots à coordonner ? Sélectionnez les métiers concernés et décrivez-nous simplement votre projet.</p>
    </div>
    <ul class="metier-grid">
      ${metiers
        .map(
          (m, i) => `<li class="metier-card" data-card="${m.slug}">
        <div class="metier-top"><span class="metier-icon">${icon(m.slug)}</span><span class="metier-num">0${i + 1}</span></div>
        <h3><a href="/metiers/${m.slug}/">${m.name}</a></h3>
        <p>${m.short}</p>
        <button type="button" class="metier-add" data-add="${m.slug}" aria-pressed="false">
          <span class="when-off">${icon("plus")}Ajouter au projet</span>
          <span class="when-on">${icon("check")}Ajouté au projet</span>
        </button>
      </li>`
        )
        .join("")}
    </ul>
  </div>
</section>

${methodSection()}

<section class="section section-paper" id="zone" aria-labelledby="zone-title">
  <div class="container zone-grid">
    <div>
      <p class="eyebrow">Zone d’intervention</p>
      <h2 id="zone-title" class="h2">Près de vous, sur un large secteur.</h2>
      <p class="section-intro">Nous étudions les projets dans toute l’Île-de-France ainsi que dans les départements limitrophes de l’Oise et de l’Eure.</p>
      <a class="link-arrow" href="/zone-intervention/">Voir la zone d’intervention ${icon("arrow")}</a>
    </div>
    ${zoneSummary}
  </div>
</section>

<section class="section" id="faq" aria-labelledby="faq-title">
  <div class="container faq-grid">
    <div>
      <p class="eyebrow">Questions fréquentes</p>
      <h2 id="faq-title" class="h2">Ce que l’on nous demande souvent.</h2>
    </div>
    ${faqHtml(homeFaq)}
  </div>
</section>

<section class="section section-ink section-contact" id="projet" aria-labelledby="projet-title">
  <div class="container contact-grid">
    <div class="contact-copy">
      <p class="eyebrow eyebrow-light">Votre projet</p>
      <h2 id="projet-title" class="h2">Parlons de ce que vous voulez transformer.</h2>
      <p>Quelques informations suffisent pour préparer un premier échange efficace.</p>
      <ul class="contact-points">
        <li>${icon("shield")}<span><strong>Demande sans engagement</strong>Vos informations servent uniquement à étudier votre projet.</span></li>
        <li>${icon("phone")}<span><strong>Plutôt par téléphone ?</strong><a href="tel:${site.phone}">${site.phoneDisplay}</a></span></li>
      </ul>
    </div>
    <div class="form-card">${quoteForm("home-form")}</div>
  </div>
</section>`;

  return page({
    path: "/",
    title: "Nexora Travaux | Rénovation en Île-de-France : les bons pros, un seul contact",
    description:
      "Électricité, plomberie, peinture, sols, carrelage… Nexora Travaux cadre votre projet, organise la visite et vous met en relation avec les bons professionnels en Île-de-France, Oise et Eure. Demande sans engagement.",
    body,
    preloadHero: true,
    jsonld: [
      businessLd,
      { "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: site.url + "/" },
      faqLd(homeFaq),
    ],
  });
}

/* ------------------------------------------------------------------ */

function metierPage(m) {
  const bc = breadcrumb([
    ["Accueil", "/"],
    ["Nos métiers", "/#metiers"],
    [m.name, `/metiers/${m.slug}/`],
  ]);
  const others = metiers.filter((o) => o.slug !== m.slug);
  const body = `
<section class="page-hero">
  <div class="container">
    ${bc.html}
    <div class="page-hero-grid">
      <div>
        <span class="metier-icon metier-icon-lg">${icon(m.slug)}</span>
        <h1 class="h1">${m.title}</h1>
        <p class="lead">${m.intro}</p>
        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="/devis/?metier=${m.slug}">Demander un devis ${icon("arrow")}</a>
          <a class="btn btn-outline btn-lg" href="tel:${site.phone}">${icon("phone")}${site.phoneDisplay}</a>
        </div>
      </div>
      <aside class="aside-card">
        <h2 class="h4">Pour préparer votre demande</h2>
        <ul class="check-list">${m.conseils.map((c) => `<li>${icon("check")}${c}</li>`).join("")}</ul>
      </aside>
    </div>
  </div>
</section>

<section class="section">
  <div class="container two-col">
    <div>
      <p class="eyebrow">${m.name}</p>
      <h2 class="h2">Les travaux que nous pouvons organiser</h2>
    </div>
    <ul class="presta-list">${m.prestations.map((p) => `<li>${icon("check")}${p}</li>`).join("")}</ul>
  </div>
</section>

${methodSection()}

<section class="section">
  <div class="container faq-grid">
    <div>
      <p class="eyebrow">Questions fréquentes</p>
      <h2 class="h2">${m.name} : vos questions</h2>
    </div>
    ${faqHtml(m.faq)}
  </div>
</section>

<section class="section section-paper">
  <div class="container">
    <h2 class="h3">Souvent associés à vos travaux</h2>
    <ul class="mini-metiers">
      ${others
        .map(
          (o) =>
            `<li><a href="/metiers/${o.slug}/"><span class="metier-icon">${icon(o.slug)}</span>${o.name}${icon("arrow", "icon mini-arrow")}</a></li>`
        )
        .join("")}
    </ul>
  </div>
</section>

${ctaBand(`Votre projet de ${m.name.toLowerCase()}, sans engagement.`)}`;

  return page({
    path: `/metiers/${m.slug}/`,
    title: `${m.metaTitle} | Nexora Travaux`,
    description: `${m.title} : ${m.short.toLowerCase()}. Nous cadrons votre besoin, organisons la visite et vous mettons en relation avec un professionnel adapté. Demande sans engagement.`,
    current: "metiers",
    body,
    jsonld: [
      bc.ld,
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: m.title,
        serviceType: m.name,
        description: m.intro,
        provider: { "@id": site.url + "/#entreprise" },
        areaServed: ["Île-de-France", "Oise", "Eure"].map((n) => ({ "@type": "AdministrativeArea", name: n })),
      },
      faqLd(m.faq),
    ],
  });
}

/* ------------------------------------------------------------------ */

function zonePage() {
  const bc = breadcrumb([
    ["Accueil", "/"],
    ["Zone d’intervention", "/zone-intervention/"],
  ]);
  const body = `
<section class="page-hero">
  <div class="container">
    ${bc.html}
    <div class="page-hero-narrow">
      <h1 class="h1">Zone d’intervention : Île-de-France, Oise et Eure</h1>
      <p class="lead">Nous étudions les projets de rénovation dans toute l’Île-de-France, ainsi que dans les départements limitrophes de l’Oise et de l’Eure.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="h2">Île-de-France</h2>
    <p class="section-intro">Notre zone principale : Paris et l’ensemble des départements franciliens.</p>
    <ul class="dept-grid">
      ${zones.idf.departements
        .map(
          ([n, name]) =>
            `<li class="dept-card"><span class="dept-num">${n}</span><span class="dept-name">${name}</span></li>`
        )
        .join("")}
    </ul>
  </div>
</section>

<section class="section section-paper" id="limitrophes">
  <div class="container">
    <h2 class="h2">Départements limitrophes</h2>
    <p class="section-intro">Nous étudions également les projets dans l’Oise et dans l’Eure. Indiquez votre code postal dans votre demande : nous vous confirmons rapidement la prise en charge.</p>
    <ul class="dept-grid dept-grid-2">
      ${zones.limitrophes
        .map(
          ([n, name]) =>
            `<li class="dept-card"><span class="dept-num">${n}</span><span class="dept-name">${name}</span></li>`
        )
        .join("")}
    </ul>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="h3">Les métiers disponibles sur toute la zone</h2>
    <ul class="mini-metiers">
      ${metiers
        .map(
          (o) =>
            `<li><a href="/metiers/${o.slug}/"><span class="metier-icon">${icon(o.slug)}</span>${o.name}${icon("arrow", "icon mini-arrow")}</a></li>`
        )
        .join("")}
    </ul>
  </div>
</section>

${ctaBand()}`;
  return page({
    path: "/zone-intervention/",
    title: "Zone d’intervention : Paris, Île-de-France, Oise et Eure | Nexora Travaux",
    description:
      "Nexora Travaux étudie vos projets de rénovation à Paris et dans toute l’Île-de-France (77, 78, 91, 92, 93, 94, 95), ainsi que dans l’Oise (60) et l’Eure (27).",
    current: "zone",
    body,
    jsonld: [bc.ld, businessLd],
  });
}

/* ------------------------------------------------------------------ */

function devisPage() {
  const bc = breadcrumb([
    ["Accueil", "/"],
    ["Demander un devis", "/devis/"],
  ]);
  const body = `
<section class="page-hero page-hero-tight">
  <div class="container">
    ${bc.html}
  </div>
</section>
<section class="section section-tight">
  <div class="container contact-grid contact-grid-light">
    <div class="contact-copy">
      <h1 class="h1">Parlons de ce que vous voulez transformer.</h1>
      <p class="lead">Quelques informations suffisent pour préparer un premier échange efficace.</p>
      <ol class="mini-steps">
        ${steps.map(([ic, t, d], i) => `<li><span class="step-num">0${i + 1}</span><span><strong>${t}</strong>${d}</span></li>`).join("")}
      </ol>
      <ul class="contact-points">
        <li>${icon("shield")}<span><strong>Demande sans engagement</strong>Vos informations servent uniquement à étudier votre projet.</span></li>
        <li>${icon("phone")}<span><strong>Plutôt par téléphone ?</strong><a href="tel:${site.phone}">${site.phoneDisplay}</a></span></li>
      </ul>
    </div>
    <div class="form-card form-card-raised">${quoteForm("devis-form")}</div>
  </div>
</section>`;
  return page({
    path: "/devis/",
    title: "Demander un devis travaux sans engagement | Nexora Travaux",
    description:
      "Décrivez votre projet de rénovation en quelques lignes : nous organisons la visite et l’entreprise réalisatrice vous transmet un devis détaillé. Sans engagement.",
    body,
    jsonld: [bc.ld],
  });
}

/* ------------------------------------------------------------------ */

const todo = (t) => `<mark class="todo">[À compléter : ${t}]</mark>`;

function legalPage() {
  const body = `
<section class="page-hero page-hero-tight"><div class="container">${breadcrumb([["Accueil", "/"], ["Mentions légales", "/mentions-legales/"]]).html}</div></section>
<section class="section section-tight">
  <div class="container prose">
    <h1 class="h1">Mentions légales</h1>
    <h2>Éditeur du site</h2>
    <p>${site.name}<br>
    Responsable de la publication : ${todo("nom et prénom")}<br>
    Statut juridique : ${todo("forme juridique, ex. micro-entreprise")}<br>
    SIRET : ${todo("numéro SIRET")}<br>
    Adresse : ${todo("adresse postale")}<br>
    Téléphone : <a href="tel:${site.phone}">${site.phoneDisplay}</a></p>
    <h2>Hébergement</h2>
    <p>Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, États-Unis — <a href="https://www.cloudflare.com" rel="noopener">cloudflare.com</a></p>
    <h2>Activité</h2>
    <p>${site.name} accompagne les particuliers dans la préparation de leurs projets de travaux et les met en relation avec des professionnels. Les travaux sont chiffrés et réalisés par l’entreprise réalisatrice, qui transmet directement sa proposition au client.</p>
    <h2>Propriété intellectuelle</h2>
    <p>L’ensemble des contenus de ce site (textes, éléments graphiques, logo) est protégé. Toute reproduction sans autorisation préalable est interdite.</p>
    <h2>Données personnelles</h2>
    <p>Consultez notre <a href="/confidentialite/">politique de confidentialité</a>.</p>
  </div>
</section>`;
  return page({
    path: "/mentions-legales/",
    title: "Mentions légales | Nexora Travaux",
    description: "Mentions légales du site Nexora Travaux.",
    body,
  });
}

function privacyPage() {
  const body = `
<section class="page-hero page-hero-tight"><div class="container">${breadcrumb([["Accueil", "/"], ["Confidentialité", "/confidentialite/"]]).html}</div></section>
<section class="section section-tight">
  <div class="container prose">
    <h1 class="h1">Politique de confidentialité</h1>
    <h2>Données collectées</h2>
    <p>Le formulaire de demande ne stocke aucune donnée sur ce site. Lorsque vous cliquez sur « Continuer sur WhatsApp » ou « Envoyer par SMS », un message pré-rempli s’ouvre dans votre application : vous le relisez et choisissez de l’envoyer ou non. Seules les informations que vous nous envoyez ainsi (nom, code postal, type de travaux, description du projet, et votre numéro de téléphone) nous parviennent.</p>
    <h2>Finalité</h2>
    <p>Ces informations servent uniquement à étudier votre projet, à organiser la visite et à vous mettre en relation avec le professionnel adapté. Elles peuvent être transmises à ce professionnel dans ce seul but.</p>
    <h2>Durée de conservation</h2>
    <p>Les échanges sont conservés le temps nécessaire au suivi de votre projet, puis supprimés au plus tard trois ans après le dernier contact.</p>
    <h2>Cookies et mesure d’audience</h2>
    <p>Ce site n’utilise pas de cookie publicitaire ni d’outil de suivi.</p>
    <h2>Vos droits</h2>
    <p>Vous pouvez demander l’accès, la rectification ou la suppression de vos données en nous contactant au <a href="tel:${site.phone}">${site.phoneDisplay}</a>. Vous pouvez également introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" rel="noopener">cnil.fr</a>).</p>
    <p>Responsable du traitement : ${site.name}, ${todo("nom et adresse du responsable")}</p>
  </div>
</section>`;
  return page({
    path: "/confidentialite/",
    title: "Politique de confidentialité | Nexora Travaux",
    description: "Comment Nexora Travaux traite les informations transmises lors d’une demande de devis.",
    body,
  });
}

function notFound() {
  const body = `<section class="section">
  <div class="container page-hero-narrow center">
    <p class="eyebrow">Erreur 404</p>
    <h1 class="h1">Cette page n’existe pas (ou plus).</h1>
    <p class="lead">Pas de panique : retrouvez nos métiers ou décrivez-nous directement votre projet.</p>
    <div class="hero-actions center">
      <a class="btn btn-primary btn-lg" href="/">Retour à l’accueil</a>
      <a class="btn btn-outline btn-lg" href="/devis/">Demander un devis</a>
    </div>
  </div>
</section>`;
  return page({ path: "/404", title: "Page introuvable | Nexora Travaux", description: "Page introuvable.", body, noindex: true });
}

export function allPages() {
  return [
    ["index.html", home(), "/", "1.0"],
    ...metiers.map((m) => [`metiers/${m.slug}/index.html`, metierPage(m), `/metiers/${m.slug}/`, "0.8"]),
    ["zone-intervention/index.html", zonePage(), "/zone-intervention/", "0.7"],
    ["devis/index.html", devisPage(), "/devis/", "0.9"],
    ["mentions-legales/index.html", legalPage(), "/mentions-legales/", "0.2"],
    ["confidentialite/index.html", privacyPage(), "/confidentialite/", "0.2"],
    ["404.html", notFound(), null, null],
  ];
}
