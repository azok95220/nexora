import { site, metiers, zones, scenarios } from "./data.mjs";
import { page, icon, split, breadcrumb, businessLd, faqLd, faqHtml, quoteForm, waDirect } from "./layout.mjs";

const homeFaq = [
  [
    "Pourquoi passer par Nexora plutôt que d’appeler des artisans moi-même ?",
    "Pour gagner du temps et de la tranquillité : au lieu d’appeler des dizaines d’entreprises, vous envoyez un seul message. Mickaël, fort de plus de 10 ans dans le BTP, sélectionne les bons professionnels de son réseau, négocie les prix pour vous et suit vos travaux jusqu’au bout.",
  ],
  [
    "Le devis est-il gratuit ?",
    "Oui. L’étude de votre demande, la visite et le devis sont gratuits et sans engagement : vous décidez ensuite librement de donner suite ou non.",
  ],
  [
    "Comment vous contacter le plus simplement ?",
    "Par WhatsApp : remplissez le formulaire en trois étapes, votre message est préparé automatiquement et vous n’avez plus qu’à l’envoyer, avec des photos si vous le souhaitez. Vous pouvez aussi nous appeler ou nous écrire par e-mail.",
  ],
  [
    "Qui réalise les travaux ?",
    "Des entreprises et artisans de notre réseau, sélectionnés selon la nature de votre chantier. Nexora négocie les prix pour vous, reste votre interlocuteur unique et suit les travaux du début à la fin."
  ],
  [
    "Puis-je regrouper plusieurs métiers dans une seule demande ?",
    "Oui, c’est tout l’intérêt : sélectionnez les métiers concernés (par exemple plomberie, carrelage et électricité pour une salle de bain) et décrivez votre projet en une seule fois.",
  ],
  [
    "Dans quelles zones intervenez-vous ?",
    "Nous intervenons à Paris et dans toute l’Île-de-France : Hauts-de-Seine (92), Seine-Saint-Denis (93), Val-de-Marne (94), Seine-et-Marne (77), Yvelines (78), Essonne (91) et Val-d’Oise (95).",
  ],
];

const steps = [
  ["whatsapp", "Vous nous expliquez", "Type de travaux, adresse, photos et disponibilités : nous réunissons les informations utiles, simplement par WhatsApp."],
  ["calendar", "Nous organisons la visite", "Un rendez-vous est fixé avec l’interlocuteur capable d’évaluer précisément votre chantier."],
  ["file", "Vous recevez votre devis gratuit", "Nous négocions pour vous et l’entreprise retenue vous transmet une proposition détaillée, sans engagement."],
  ["check", "Nous suivons vos travaux", "Du démarrage à la dernière finition, Nexora reste votre interlocuteur unique et suit le chantier pour vous."],
];

const pad = (n) => String(n).padStart(2, "0");

const methodSection = () => `<section class="method" id="methode" aria-labelledby="methode-title" data-hscroll>
  <div class="method-sticky">
    <div class="container method-head">
      <div>
        <p class="eyebrow eyebrow-light">La méthode Nexora</p>
        <h2 id="methode-title" class="h2">Du premier message<br>à la dernière finition.</h2>
      </div>
      <div class="method-meter" aria-hidden="true"><span></span></div>
    </div>
    <ol class="method-track">
      ${steps
        .map(
          ([ic, t, d], i) => `<li class="step-card reveal">
        <span class="step-num">${pad(i + 1)}</span>
        <span class="step-icon">${icon(ic)}</span>
        <h3>${t}</h3>
        <p>${d}</p>
      </li>`
        )
        .join("")}
      <li class="step-card step-card-cta reveal">
        <p class="step-cta-kicker">Étape 00</p>
        <h3>Tout commence par un message.</h3>
        <a class="btn btn-whatsapp btn-lg magnetic" href="/devis/" data-to-form>${icon("whatsapp")}Je me lance</a>
      </li>
    </ol>
  </div>
</section>`;

const zoneRadar = `<div class="radar" aria-hidden="true">
  <span class="radar-ring r1"></span><span class="radar-ring r2"></span><span class="radar-ring r3"></span>
  <span class="radar-sweep"></span>
  ${zones.idf.departements
    .filter(([n]) => n !== "75")
    .map(([n, name]) => `<span class="radar-tag t-${n}" data-dept="${n}"><i></i>${n}<em>${name}</em></span>`)
    .join("")}
  <div class="radar-center" data-dept="75">${icon("pin")}<strong>PARIS</strong><span>75</span></div>
</div>`;

const zoneChecker = (id) => `<form class="zone-check" data-zone-check novalidate>
  <label for="${id}">Votre code postal</label>
  <div class="zone-check-row">
    <input id="${id}" inputmode="numeric" maxlength="5" pattern="[0-9]{5}" placeholder="Ex. 92100" autocomplete="postal-code">
    <button class="btn btn-primary" type="submit">Vérifier</button>
  </div>
  <p class="zone-result" role="status" aria-live="polite"></p>
</form>`;

const ctaBand = (title = "Un projet en tête ? Parlons-en.") => `<section class="cta-band">
  <div class="container cta-inner reveal">
    <h2 class="h2">${title}</h2>
    <p>Devis gratuit et sans engagement. Quelques informations suffisent pour préparer un premier échange efficace.</p>
    <div class="cta-actions">
      <a class="btn btn-whatsapp btn-lg magnetic" href="/devis/">${icon("whatsapp")}Devis gratuit sur WhatsApp</a>
      <a class="btn btn-glass btn-lg" href="tel:${site.phone}">${icon("phone")}${site.phoneDisplay}</a>
    </div>
  </div>
</section>`;

const ticker = (reverse = false) => {
  const items = metiers.map((m) => `<span>${m.name}</span><i>${icon("spark")}</i>`).join("");
  return `<div class="ticker${reverse ? " ticker-rev" : ""}" aria-hidden="true" data-ticker><div class="ticker-track">${items}${items}${items}</div></div>`;
};

/* Scène « avant / après » : les artisans éparpillés convergent vers un seul contact */
const story = () => {
  const scatter = [[12, 18], [78, 12], [88, 52], [70, 86], [26, 84], [6, 54], [44, 6], [52, 94]];
  const notes = [["missed", "Appel manqué", 30, 28], ["clock", "Devis en attente…", 64, 30], ["chat", "Pas de réponse", 20, 66], ["file", "3 devis incomparables", 62, 72]];
  const nodes = metiers
    .map((m, i) => {
      const a = (i / metiers.length) * Math.PI * 2 - Math.PI / 2;
      const ox = (50 + Math.cos(a) * 36).toFixed(1);
      const oy = (50 + Math.sin(a) * 36).toFixed(1);
      const [sx, sy] = scatter[i];
      const r = ((i * 37) % 30) - 15;
      return `<span class="node" style="--sx:${sx}%;--sy:${sy}%;--ox:${ox}%;--oy:${oy}%;--r:${r}deg">${icon(m.slug)}<b>${m.name}</b></span>`;
    })
    .join("");
  const lines = metiers
    .map((m, i) => {
      const a = (i / metiers.length) * Math.PI * 2 - Math.PI / 2;
      const pt = (r) => [(50 + Math.cos(a) * r).toFixed(1), (50 + Math.sin(a) * r).toFixed(1)];
      const [x1, y1] = pt(i === 4 ? 25 : i === 3 || i === 5 ? 22 : 16);
      const [x2, y2] = pt(30);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" pathLength="1"/>`;
    })
    .join("");
  return `<section class="story" id="pourquoi" aria-labelledby="story-title" data-story>
  <div class="story-sticky">
    <div class="container story-grid">
      <div class="story-copy">
        <p class="eyebrow eyebrow-light">Pourquoi Nexora</p>
        <h2 id="story-title" class="visually-hidden">Sans Nexora, avec Nexora</h2>
        <p class="story-line story-before"><span class="story-tag">Sans Nexora</span>Rénover, c’est souvent <em>des dizaines d’appels</em>, des rappels qui n’arrivent pas et des artisans à coordonner seul.</p>
        <p class="story-line story-after"><span class="story-tag">Avec Nexora</span>Un <em>seul message</em>. Mickaël sélectionne les bons pros, négocie les prix et suit votre chantier.</p>
        <a class="btn btn-whatsapp btn-lg magnetic story-cta" href="/devis/" data-to-form>${icon("whatsapp")}Envoyer mon message</a>
      </div>
      <div class="story-stage" aria-hidden="true">
        <svg class="story-lines" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>
        ${notes.map(([ic, t, x, y]) => `<span class="notif" style="--x:${x}%;--y:${y}%">${icon(ic)}${t}</span>`).join("")}
        ${nodes}
        <span class="hub"><span class="hub-core">${icon("user")}</span><b>Mickaël</b><small>Votre contact unique</small></span>
      </div>
    </div>
    <div class="story-progress" aria-hidden="true"><span></span></div>
  </div>
</section>`;
};

const chat = `<div class="phone reveal" aria-label="Exemple d’échange sur WhatsApp" role="img">
  <div class="phone-top">
    <span class="phone-avatar">M</span>
    <span><strong>Mickaël · Nexora</strong><small>en ligne</small></span>
  </div>
  <div class="phone-body">
    <p class="phone-label">Exemple d’échange</p>
    <div class="msg msg-in" style="--d:0">Bonjour, je voudrais refaire ma salle de bain (6 m²). Je vous envoie quelques photos.</div>
    <div class="msg msg-in msg-photos" style="--d:1"><span></span><span></span><span></span></div>
    <div class="msg msg-typing" style="--d:2"><i></i><i></i><i></i></div>
    <div class="msg msg-out" style="--d:3">Bonjour ! Merci pour les photos. Il faudra plomberie, carrelage et un peu d’électricité. Visite jeudi à 18 h ?</div>
    <div class="msg msg-in" style="--d:4">Parfait 👍</div>
    <div class="msg msg-out" style="--d:5">C’est noté. Je m’occupe de tout et je reviens vers vous avec le devis.</div>
  </div>
</div>`;

/* ------------------------------------------------------------------ */

function home() {
  const body = `
<section class="hero" id="top" data-hero>
  <div class="hero-media">
    <img src="/assets/img/hero-1600.webp" srcset="/assets/img/hero-800.webp 800w, /assets/img/hero-1200.webp 1200w, /assets/img/hero-1600.webp 1600w" sizes="100vw" width="1600" height="900" alt="Professionnel étudiant les plans d’une rénovation dans un appartement parisien" fetchpriority="high">
  </div>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="hero-blueprint" aria-hidden="true"></div>
  <p class="hero-coords" aria-hidden="true"><span>48°51′N</span><span>2°21′E</span><span>Paris · Île-de-France</span></p>
  <div class="container hero-inner">
    <div class="hero-copy">
      <p class="pill enter" style="--d:0"><span class="live"></span>Devis gratuit · Réponse sur WhatsApp</p>
      <h1 class="display">${split("Vos travaux.|*Un seul contact.*")}</h1>
      <p class="lead enter" style="--d:4">Électricité, plomberie, peinture, sols… Mickaël sélectionne les bons professionnels, négocie les prix et suit votre chantier, à Paris et dans toute l’Île-de-France.</p>
      <div class="hero-actions enter" style="--d:5">
        <a class="btn btn-whatsapp btn-lg magnetic" href="#projet" data-to-form>${icon("whatsapp")}Devis gratuit sur WhatsApp</a>
        <a class="btn btn-glass btn-lg" href="#pourquoi">Comment ça marche</a>
      </div>
      <ul class="trust enter" style="--d:6">
        <li>${icon("check")}10+ ans dans le BTP</li>
        <li>${icon("user")}Un interlocuteur dédié</li>
        <li>${icon("shield")}Sans engagement</li>
      </ul>
    </div>
  </div>
  <a class="seal enter" style="--d:7" href="#projet" data-to-form aria-label="Devis gratuit et sans engagement">
    <svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="seal-path" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"/></defs><text><textPath href="#seal-path" textLength="286" lengthAdjust="spacing">DEVIS GRATUIT • SANS ENGAGEMENT • NEXORA • </textPath></text></svg>
    ${icon("arrow", "icon seal-arrow")}
  </a>
  <a class="scroll-hint" href="#pourquoi" aria-label="Faire défiler"><span></span></a>
</section>

${ticker()}

${story()}

<section class="section founder" id="mickael" aria-labelledby="founder-title">
  <div class="container founder-grid">
    <div class="founder-copy">
      <p class="eyebrow reveal">Le mot du fondateur</p>
      <h2 id="founder-title" class="h1 reveal">Bonjour,<br>je m’appelle <span class="accent-blue">Mickaël.</span></h2>
      <div class="founder-text reveal">
        <p>Je travaille dans le <strong>BTP depuis plus de 10 ans</strong>. Au fil des chantiers, je me suis constitué un solide réseau d’entreprises et d’artisans de confiance.</p>
        <p>Mon rôle : <strong>trouver les bons professionnels pour votre projet, négocier pour vous les meilleurs prix et suivre vos travaux</strong> jusqu’à la dernière finition.</p>
      </div>
      <p class="founder-punch reveal">Vous n’avez qu’une chose à faire : <span>me contacter.</span></p>
      <ul class="stats reveal">
        <li><strong><span data-count="10">10</span>+</strong><span>ans dans le BTP</span></li>
        <li><strong data-count="8">8</strong><span>métiers coordonnés</span></li>
        <li><strong data-count="8">8</strong><span>départements</span></li>
        <li><strong>0 €</strong><span>pour le devis</span></li>
      </ul>
      <div class="hero-actions reveal">
        <a class="btn btn-whatsapp btn-lg magnetic" href="#projet" data-to-form>${icon("whatsapp")}Écrire à Mickaël</a>
        <a class="btn btn-outline btn-lg" href="tel:${site.phone}">${icon("phone")}${site.phoneDisplay}</a>
      </div>
    </div>
    ${chat}
  </div>
</section>

<section class="section section-paper configurator" id="metiers" aria-labelledby="metiers-title">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Composez votre projet</p>
      <h2 id="metiers-title" class="h1">Un réseau pour chaque<br>étape de votre rénovation.</h2>
      <p class="section-intro">Choisissez un projet type ou sélectionnez les métiers un par un : votre demande se prépare en direct.</p>
    </div>
    <div class="scenarios reveal" role="group" aria-label="Projets types">
      ${scenarios.map((sc) => `<button type="button" class="scenario" data-scenario="${sc.metiers.join(",")}" aria-pressed="false">${sc.name}</button>`).join("")}
    </div>
    <div class="config-grid">
      <ul class="metier-grid">
        ${metiers
          .map(
            (m, i) => `<li class="metier-card reveal" data-card="${m.slug}" style="--i:${i}">
          <div class="metier-top"><span class="metier-icon">${icon(m.slug)}</span><span class="metier-num">${pad(i + 1)}</span></div>
          <h3><a href="/metiers/${m.slug}/">${m.name}</a></h3>
          <p>${m.short}</p>
          <button type="button" class="metier-add" data-add="${m.slug}" aria-pressed="false" aria-label="Ajouter ${m.name} au projet">
            <span class="when-off">${icon("plus")}Ajouter</span>
            <span class="when-on">${icon("check")}Ajouté</span>
          </button>
        </li>`
          )
          .join("")}
      </ul>
      <aside class="summary reveal" aria-live="polite">
        <p class="summary-kicker">Votre projet</p>
        <p class="summary-count"><strong data-summary-count>0</strong> métier<span data-summary-plural></span></p>
        <ul class="summary-list" data-summary-list><li class="summary-empty">Aucun métier pour l’instant.</li></ul>
        <a class="btn btn-whatsapp btn-lg magnetic summary-cta" href="#projet" data-to-form>${icon("whatsapp")}Envoyer mon projet</a>
        <p class="summary-note">Gratuit · sans engagement</p>
      </aside>
    </div>
  </div>
</section>

${methodSection()}

<section class="section zone" id="zone" aria-labelledby="zone-title">
  <div class="container zone-grid">
    <div class="reveal">
      <p class="eyebrow eyebrow-light">Zone d’intervention</p>
      <h2 id="zone-title" class="h1">Paris et toute<br>l’Île-de-France.</h2>
      <p class="section-intro">Paris, la petite et la grande couronne : un seul contact pour toute la région. Vérifiez en une seconde.</p>
      ${zoneChecker("zone-cp")}
    </div>
    <div class="reveal">${zoneRadar}</div>
  </div>
</section>

${ticker(true)}

<section class="section" id="faq" aria-labelledby="faq-title">
  <div class="container faq-grid">
    <div class="faq-head reveal">
      <p class="eyebrow">Questions fréquentes</p>
      <h2 id="faq-title" class="h1">Ce que l’on nous demande souvent.</h2>
      <a class="btn btn-outline" href="${waDirect}" rel="noopener">${icon("chat")}Une autre question ?</a>
    </div>
    ${faqHtml(homeFaq)}
  </div>
</section>

<section class="section section-ink section-contact" id="projet" aria-labelledby="projet-title">
  <div class="contact-glow" aria-hidden="true"></div>
  <div class="container contact-grid">
    <div class="contact-copy">
      <p class="eyebrow eyebrow-light reveal">Votre projet</p>
      <h2 id="projet-title" class="h1 reveal">Parlons de ce que vous voulez <span class="accent">transformer.</span></h2>
      <p class="reveal">Trois étapes, moins d’une minute : votre message est prêt à partir sur WhatsApp, photos comprises.</p>
      <ul class="contact-points reveal">
        <li>${icon("check")}<span><strong>Devis gratuit et sans engagement</strong>Vos informations servent uniquement à étudier votre projet.</span></li>
        <li>${icon("whatsapp")}<span><strong>Réponse par WhatsApp</strong>Le canal le plus simple pour envoyer des photos.</span></li>
        <li>${icon("phone")}<span><strong>Plutôt par téléphone ?</strong><a href="tel:${site.phone}">${site.phoneDisplay}</a></span></li>
      </ul>
    </div>
    <div class="form-card reveal">${quoteForm("home-form")}</div>
  </div>
</section>`;

  return page({
    path: "/",
    title: "Nexora Travaux | Devis travaux gratuit en Île-de-France : les bons pros, un seul contact",
    description:
      "Électricité, plomberie, peinture, sols, carrelage… Nexora Travaux sélectionne les bons professionnels, négocie les prix et suit votre chantier à Paris et en Île-de-France. Devis gratuit, échange simple sur WhatsApp.",
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
<section class="page-hero page-hero-dark">
  <span class="page-hero-watermark" aria-hidden="true">${icon(m.slug)}</span>
  <div class="hero-blueprint" aria-hidden="true"></div>
  <div class="container">
    ${bc.html}
    <div class="page-hero-grid">
      <div>
        <p class="pill enter" style="--d:0"><span class="metier-icon metier-icon-sm">${icon(m.slug)}</span>${m.name}</p>
        <h1 class="h1">${split(m.title)}</h1>
        <p class="lead enter" style="--d:4">${m.intro}</p>
        <div class="hero-actions enter" style="--d:5">
          <a class="btn btn-whatsapp btn-lg magnetic" href="/devis/?metier=${m.slug}">${icon("whatsapp")}Devis gratuit sur WhatsApp</a>
          <a class="btn btn-glass btn-lg" href="tel:${site.phone}">${icon("phone")}${site.phoneDisplay}</a>
        </div>
      </div>
      <aside class="aside-card enter" style="--d:6">
        <h2 class="h4">Pour préparer votre demande</h2>
        <ul class="check-list">${m.conseils.map((c) => `<li>${icon("check")}${c}</li>`).join("")}</ul>
      </aside>
    </div>
  </div>
</section>

<section class="section">
  <div class="container two-col">
    <div class="sticky-head reveal">
      <p class="eyebrow">${m.name}</p>
      <h2 class="h1">Les travaux que nous pouvons organiser.</h2>
    </div>
    <ol class="presta-list">${m.prestations.map((p, i) => `<li class="reveal"><span>${pad(i + 1)}</span>${p}</li>`).join("")}</ol>
  </div>
</section>

${methodSection()}

<section class="section">
  <div class="container faq-grid">
    <div class="faq-head reveal">
      <p class="eyebrow">Questions fréquentes</p>
      <h2 class="h1">${m.name} : vos questions.</h2>
    </div>
    ${faqHtml(m.faq)}
  </div>
</section>

<section class="section section-paper">
  <div class="container">
    <h2 class="h2 reveal">Souvent associés à vos travaux.</h2>
    <ul class="mini-metiers">
      ${others
        .map(
          (o) =>
            `<li class="reveal"><a href="/metiers/${o.slug}/"><span class="metier-icon">${icon(o.slug)}</span><span>${o.name}<small>${o.short}</small></span>${icon("arrow", "icon mini-arrow")}</a></li>`
        )
        .join("")}
    </ul>
  </div>
</section>

${ctaBand(`Votre projet de ${m.name.toLowerCase()} : devis gratuit.`)}`;

  return page({
    path: `/metiers/${m.slug}/`,
    title: `${m.metaTitle} | Nexora Travaux`,
    description: `${m.title} : ${m.short.toLowerCase()}. Nous organisons la visite et vous mettons en relation avec un professionnel adapté. Devis gratuit et sans engagement.`,
    current: "metiers",
    theme: "dark",
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
        areaServed: { "@type": "AdministrativeArea", name: "Île-de-France" },
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
<section class="page-hero page-hero-dark">
  <div class="hero-blueprint" aria-hidden="true"></div>
  <div class="container">
    ${bc.html}
    <div class="page-hero-grid">
      <div>
        <h1 class="h1">${split("Zone d’intervention :|*Paris et toute l’Île-de-France*")}</h1>
        <p class="lead enter" style="--d:4">Nous intervenons sur vos projets de rénovation à Paris et dans les huit départements franciliens. Vérifiez votre code postal.</p>
        <div class="enter" style="--d:5">${zoneChecker("zone-page-cp")}</div>
      </div>
      <div class="enter" style="--d:6">${zoneRadar}</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="h1 reveal">Île-de-France.</h2>
    <p class="section-intro reveal">Paris, la petite couronne et la grande couronne : un seul contact pour toute la région.</p>
    <ul class="dept-grid">
      ${zones.idf.departements
        .map(
          ([n, name]) =>
            `<li class="dept-card reveal"><span class="dept-num">${n}</span><span class="dept-name">${name}</span></li>`
        )
        .join("")}
    </ul>
  </div>
</section>

<section class="section section-paper">
  <div class="container">
    <h2 class="h2 reveal">Les métiers disponibles sur toute la zone.</h2>
    <ul class="mini-metiers">
      ${metiers
        .map(
          (o) =>
            `<li class="reveal"><a href="/metiers/${o.slug}/"><span class="metier-icon">${icon(o.slug)}</span><span>${o.name}<small>${o.short}</small></span>${icon("arrow", "icon mini-arrow")}</a></li>`
        )
        .join("")}
    </ul>
  </div>
</section>

${ctaBand()}`;
  return page({
    path: "/zone-intervention/",
    title: "Zone d’intervention : Paris et toute l’Île-de-France | Nexora Travaux",
    description:
      "Nexora Travaux intervient sur vos projets de rénovation à Paris (75) et dans toute l’Île-de-France : 77, 78, 91, 92, 93, 94 et 95. Devis gratuit.",
    current: "zone",
    theme: "dark",
    body,
    jsonld: [bc.ld, businessLd],
  });
}

/* ------------------------------------------------------------------ */

function devisPage() {
  const bc = breadcrumb([
    ["Accueil", "/"],
    ["Devis gratuit", "/devis/"],
  ]);
  const body = `
<section class="section section-ink section-contact devis-hero">
  <div class="contact-glow" aria-hidden="true"></div>
  <div class="container">
    ${bc.html}
    <div class="contact-grid">
      <div class="contact-copy">
        <p class="eyebrow eyebrow-light">Devis gratuit</p>
        <h1 class="h1">${split("Parlons de ce que vous voulez *transformer.*")}</h1>
        <p class="lead">Trois étapes, moins d’une minute : votre message est prêt à envoyer sur WhatsApp.</p>
        <ol class="mini-steps">
          ${steps.map(([ic, t, d], i) => `<li><span class="mini-num">0${i + 1}</span><span><strong>${t}</strong>${d}</span></li>`).join("")}
        </ol>
        <ul class="contact-points">
          <li>${icon("check")}<span><strong>Gratuit et sans engagement</strong>Vos informations servent uniquement à étudier votre projet.</span></li>
          <li>${icon("phone")}<span><strong>Plutôt par téléphone ?</strong><a href="tel:${site.phone}">${site.phoneDisplay}</a></span></li>
          <li>${icon("mail")}<span><strong>Par e-mail</strong><a href="mailto:${site.email}">${site.email}</a></span></li>
        </ul>
      </div>
      <div class="form-card">${quoteForm("devis-form")}</div>
    </div>
  </div>
</section>`;
  return page({
    path: "/devis/",
    title: "Devis travaux gratuit et sans engagement | Nexora Travaux",
    theme: "dark",
    description:
      "Décrivez votre projet en 3 étapes et envoyez-le sur WhatsApp : nous organisons la visite et l’entreprise réalisatrice vous transmet un devis détaillé. Gratuit et sans engagement.",
    body,
    jsonld: [bc.ld],
  });
}

/* ------------------------------------------------------------------ */

const todo = (t) => `<mark class="todo">[À compléter : ${t}]</mark>`;

function legalPage() {
  const body = `
<section class="page-hero page-hero-tight page-hero-dark"><div class="container">${breadcrumb([["Accueil", "/"], ["Mentions légales", "/mentions-legales/"]]).html}</div></section>
<section class="section section-tight">
  <div class="container prose">
    <h1 class="h1">Mentions légales</h1>
    <h2>Éditeur du site</h2>
    <p>${site.name}<br>
    Responsable de la publication : ${todo("nom et prénom")}<br>
    Statut juridique : ${todo("forme juridique, ex. micro-entreprise")}<br>
    SIRET : ${todo("numéro SIRET")}<br>
    Adresse : ${todo("adresse postale")}<br>
    Téléphone : <a href="tel:${site.phone}">${site.phoneDisplay}</a><br>
    E-mail : <a href="mailto:${site.email}">${site.email}</a></p>
    <h2>Hébergement</h2>
    <p>Netlify, Inc. — 101 2nd Street, San Francisco, CA 94105, États-Unis — <a href="https://www.netlify.com" rel="noopener">netlify.com</a><br>Nom de domaine et messagerie : IONOS SARL — 7 place de la Gare, BP 70109, 57201 Sarreguemines Cedex, France</p>
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
<section class="page-hero page-hero-tight page-hero-dark"><div class="container">${breadcrumb([["Accueil", "/"], ["Confidentialité", "/confidentialite/"]]).html}</div></section>
<section class="section section-tight">
  <div class="container prose">
    <h1 class="h1">Politique de confidentialité</h1>
    <h2>Données collectées</h2>
    <p>Le formulaire de demande ne stocke aucune donnée sur ce site. Lorsque vous cliquez sur « Envoyer sur WhatsApp », « Envoyer par SMS » ou « Envoyer par e-mail », un message pré-rempli s’ouvre dans votre application : vous le relisez et choisissez de l’envoyer ou non. Seules les informations que vous nous envoyez ainsi (nom, code postal, type de travaux, description du projet, ainsi que votre numéro de téléphone ou votre adresse e-mail) nous parviennent.</p>
    <h2>Finalité</h2>
    <p>Ces informations servent uniquement à étudier votre projet, à organiser la visite et à vous mettre en relation avec le professionnel adapté. Elles peuvent être transmises à ce professionnel dans ce seul but.</p>
    <h2>Durée de conservation</h2>
    <p>Les échanges sont conservés le temps nécessaire au suivi de votre projet, puis supprimés au plus tard trois ans après le dernier contact.</p>
    <h2>Cookies et mesure d’audience</h2>
    <p>Ce site n’utilise pas de cookie publicitaire ni d’outil de suivi.</p>
    <h2>Vos droits</h2>
    <p>Vous pouvez demander l’accès, la rectification ou la suppression de vos données en nous écrivant à <a href="mailto:${site.email}">${site.email}</a> ou en nous appelant au <a href="tel:${site.phone}">${site.phoneDisplay}</a>. Vous pouvez également introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" rel="noopener">cnil.fr</a>).</p>
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
      <a class="btn btn-outline btn-lg" href="/devis/">Devis gratuit</a>
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
