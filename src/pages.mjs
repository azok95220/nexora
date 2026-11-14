import { site, metiers, zones, parrainage as P } from "./data.mjs";
import { page, icon, breadcrumb, businessLd, faqLd, faqHtml, quoteForm } from "./layout.mjs";

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

const methodSection = () => `<section class="section section-ink method" id="methode" aria-labelledby="methode-title">
  <div class="container method-grid">
    <div class="method-head reveal">
      <p class="eyebrow eyebrow-light">Notre méthode</p>
      <h2 id="methode-title" class="h2">Simple du premier message jusqu’à la fin des travaux.</h2>
      <a class="btn btn-whatsapp" href="/devis/" data-to-form>${icon("whatsapp")}Commencer sur WhatsApp</a>
    </div>
    <ol class="method-list">
      ${steps
        .map(
          ([ic, t, d], i) => `<li class="method-row reveal">
        <span class="method-num">0${i + 1}</span>
        <span class="method-icon">${icon(ic)}</span>
        <h3>${t}</h3>
        <p>${d}</p>
      </li>`
        )
        .join("")}
    </ol>
  </div>
</section>`;

const zoneRadar = `<div class="radar reveal" aria-hidden="true">
  <span class="radar-ring r1"></span><span class="radar-ring r2"></span><span class="radar-ring r3"></span>
  <span class="radar-sweep"></span>
  ${zones.idf.departements
    .filter(([n]) => n !== "75")
    .map(([n, name]) => `<span class="radar-tag t-${n}" title="${name}"><i></i>${n}</span>`)
    .join("")}
  <div class="radar-center">${icon("pin")}<strong>NEXORA</strong><span>Paris &amp; Île-de-France</span></div>
</div>`;

const ctaBand = (title = "Un projet en tête ? Parlons-en.") => `<section class="cta-band">
  <div class="container cta-inner">
    <div>
      <h2 class="h3">${title}</h2>
      <p>Devis gratuit et sans engagement. Quelques informations suffisent pour préparer un premier échange efficace.</p>
    </div>
    <div class="cta-actions">
      <a class="btn btn-whatsapp btn-lg" href="/devis/">${icon("whatsapp")}Devis gratuit sur WhatsApp</a>
      <a class="btn btn-glass btn-lg" href="tel:${site.phone}">${icon("phone")}${site.phoneDisplay}</a>
    </div>
  </div>
</section>`;

const marquee = () => {
  const items = metiers.map((m) => `<span>${icon(m.slug)}${m.name}</span>`).join("");
  return `<div class="marquee" aria-hidden="true"><div class="marquee-track">${items}${items}</div></div>`;
};

/* ------------------------------------------------------------------ */

function home() {
  const body = `
<section class="hero" id="top">
  <div class="hero-media">
    <img src="/assets/img/hero-1600.webp" srcset="/assets/img/hero-800.webp 800w, /assets/img/hero-1200.webp 1200w, /assets/img/hero-1600.webp 1600w" sizes="100vw" width="1600" height="900" alt="Professionnel étudiant les plans d’une rénovation dans un appartement parisien" fetchpriority="high">
  </div>
  <div class="container hero-inner">
    <div class="hero-copy">
      <p class="eyebrow eyebrow-light enter" style="--d:0">${site.tagline}</p>
      <h1 class="display enter" style="--d:1">Les bons professionnels.<br><span class="accent">Un seul contact.</span></h1>
      <p class="lead enter" style="--d:2">Nous cadrons votre besoin, organisons la visite et vous mettons en relation avec les professionnels adaptés à votre chantier.</p>
      <div class="hero-actions enter" style="--d:3">
        <a class="btn btn-primary btn-lg" href="#home-form" data-to-form>Parler de mon projet ${icon("arrow")}</a>
        <a class="link-light" href="#metiers">Découvrir nos métiers ${icon("arrow")}</a>
      </div>
      <ul class="trust enter" style="--d:4">
        <li>${icon("check")}Devis gratuit</li>
        <li>${icon("user")}Interlocuteur dédié</li>
        <li>${icon("shield")}Demande sans engagement</li>
        <li>${icon("pin")}Toute l’Île-de-France</li>
      </ul>
    </div>
    <a class="hero-badge enter" style="--d:5" href="#home-form" data-to-form>
      <span class="hero-badge-icon">${icon("whatsapp")}</span>
      <span><strong>Devis gratuit</strong>Échangez avec nous sur WhatsApp</span>
      ${icon("arrow", "icon hero-badge-arrow")}
    </a>
  </div>
  <a class="scroll-hint" href="#metiers" aria-label="Faire défiler vers nos métiers"><span></span></a>
</section>

${marquee()}

<section class="section founder" id="mickael" aria-labelledby="founder-title">
  <div class="container founder-grid">
    <div class="founder-card reveal">
      <div class="founder-avatar" aria-hidden="true"><span>M</span></div>
      <p class="founder-name">Mickaël</p>
      <p class="founder-role">Fondateur de Nexora Travaux</p>
      <ul class="founder-stats">
        <li><strong>10<sup>+</sup></strong><span>ans dans le BTP</span></li>
        <li><strong>1</strong><span>seul interlocuteur</span></li>
        <li><strong>0&nbsp;€</strong><span>pour le devis</span></li>
      </ul>
    </div>
    <div class="founder-copy reveal">
      <p class="eyebrow">Le mot du fondateur</p>
      <h2 id="founder-title" class="h2">Bonjour, je m’appelle Mickaël.</h2>
      <div class="founder-text">
        <p>Je travaille dans le <strong>BTP depuis plus de 10 ans</strong>. Au fil des chantiers, je me suis constitué un solide réseau d’entreprises et d’artisans de confiance.</p>
        <p>Mon rôle&#8239;: <strong>trouver les bons professionnels pour votre projet, négocier pour vous les meilleurs prix et suivre vos travaux</strong> jusqu’à la dernière finition.</p>
        <p class="founder-punch">Vous n’avez qu’une seule chose à faire&#8239;: <span>me contacter.</span><br>Nexora s’occupe de tout, du début à la fin.</p>
      </div>
      <div class="hero-actions">
        <a class="btn btn-whatsapp btn-lg" href="#home-form" data-to-form>${icon("whatsapp")}Contacter Mickaël sur WhatsApp</a>
        <a class="link-arrow link-dark" href="tel:${site.phone}">${icon("phone")}${site.phoneDisplay}</a>
      </div>
    </div>
  </div>

  <div class="container">
    <div class="versus reveal">
      <div class="versus-col versus-without">
        <p class="versus-title">Sans Nexora</p>
        <ul>
          <li>${icon("close")}Appeler des dizaines d’entreprises</li>
          <li>${icon("close")}Attendre des rappels qui n’arrivent pas</li>
          <li>${icon("close")}Comparer seul des devis incomparables</li>
          <li>${icon("close")}Coordonner chaque artisan vous-même</li>
        </ul>
      </div>
      <div class="versus-vs" aria-hidden="true">VS</div>
      <div class="versus-col versus-with">
        <p class="versus-title">Avec Nexora</p>
        <ul>
          <li>${icon("check")}Un seul message sur WhatsApp</li>
          <li>${icon("check")}Les bons professionnels, sélectionnés pour vous</li>
          <li>${icon("check")}Des prix négociés et un devis gratuit</li>
          <li>${icon("check")}Un suivi des travaux du début à la fin</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section" id="metiers" aria-labelledby="metiers-title">
  <div class="container">
    <div class="section-head section-head-split reveal">
      <div>
        <p class="eyebrow">Nos métiers</p>
        <h2 id="metiers-title" class="h2">Un réseau pour chaque étape de votre rénovation.</h2>
      </div>
      <p class="section-intro">Un besoin précis ou plusieurs lots à coordonner ? Sélectionnez les métiers concernés et décrivez-nous simplement votre projet.</p>
    </div>
    <ul class="metier-grid">
      ${metiers
        .map(
          (m, i) => `<li class="metier-card reveal" data-card="${m.slug}">
        <span class="metier-num">0${i + 1}</span>
        <span class="metier-icon">${icon(m.slug)}</span>
        <h3><a href="/metiers/${m.slug}/">${m.name}</a></h3>
        <p>${m.short}</p>
        <button type="button" class="metier-add" data-add="${m.slug}" aria-pressed="false">
          <span class="when-off">Ajouter au projet ${icon("arrow")}</span>
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
    <div class="reveal">
      <p class="eyebrow">Zone d’intervention</p>
      <h2 id="zone-title" class="h2">Près de vous, sur un large secteur.</h2>
      <p class="section-intro">Nous intervenons à Paris et dans les sept autres départements d’Île-de-France, en petite comme en grande couronne.</p>
      <ul class="zone-pills">
        ${zones.idf.departements.map(([n, name]) => `<li>${icon("pin")}${n === "75" ? "Paris" : name} (${n})</li>`).join("")}
      </ul>
      <a class="link-arrow" href="/zone-intervention/">Voir les départements couverts ${icon("arrow")}</a>
    </div>
    ${zoneRadar}
  </div>
</section>

<section class="section" id="faq" aria-labelledby="faq-title">
  <div class="container faq-grid">
    <div class="reveal">
      <p class="eyebrow">Questions fréquentes</p>
      <h2 id="faq-title" class="h2">Ce que l’on nous demande souvent.</h2>
    </div>
    ${faqHtml(homeFaq)}
  </div>
</section>

<section class="referral-band">
  <div class="container referral-band-inner reveal">
    <div class="referral-band-badge" aria-hidden="true">${P.rate}&nbsp;%</div>
    <div>
      <p class="eyebrow eyebrow-light">Parrainage</p>
      <h2 class="h3">Vous connaissez quelqu’un qui a un projet de travaux&#8239;?</h2>
      <p>Recommandez Nexora et touchez ${P.rate}&nbsp;% du montant de son chantier, jusqu’à ${P.max.toLocaleString("fr-FR")}&nbsp;€. Sans rien coûter à votre proche.</p>
    </div>
    <a class="btn btn-whatsapp btn-lg" href="/parrainage/">Je recommande Nexora ${icon("arrow")}</a>
  </div>
</section>

<section class="section section-ink section-contact" id="projet" aria-labelledby="projet-title">
  <div class="container contact-grid">
    <div class="contact-copy reveal">
      <p class="eyebrow eyebrow-light">Votre projet</p>
      <h2 id="projet-title" class="h2">Parlons de ce que vous voulez transformer.</h2>
      <p>Quelques informations suffisent pour préparer un premier échange efficace.</p>
      <ul class="contact-points">
        <li>${icon("check")}<span><strong>Devis gratuit et sans engagement</strong>Vos informations servent uniquement à étudier votre projet.</span></li>
        <li>${icon("whatsapp")}<span><strong>Réponse par WhatsApp</strong>Votre message est prêt : il ne reste qu’à l’envoyer, photos comprises.</span></li>
        <li>${icon("phone")}<span><strong>Plutôt par téléphone ?</strong><a href="tel:${site.phone}">${site.phoneDisplay}</a></span></li>
      </ul>
    </div>
    <div class="form-card">${quoteForm("home-form")}</div>
  </div>
</section>`;

  return page({
    path: "/",
    title: "Nexora Travaux | Devis travaux gratuit en Île-de-France : les bons pros, un seul contact",
    description:
      "Électricité, plomberie, peinture, sols, carrelage… Nexora Travaux cadre votre projet, organise la visite et vous met en relation avec les bons professionnels à Paris et en Île-de-France. Devis gratuit, échange simple sur WhatsApp.",
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
          <a class="btn btn-whatsapp btn-lg" href="/devis/?metier=${m.slug}">${icon("whatsapp")}Devis gratuit sur WhatsApp</a>
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

${ctaBand(`Votre projet de ${m.name.toLowerCase()} : devis gratuit.`)}`;

  return page({
    path: `/metiers/${m.slug}/`,
    title: `${m.metaTitle} | Nexora Travaux`,
    description: `${m.title} : ${m.short.toLowerCase()}. Nous organisons la visite et vous mettons en relation avec un professionnel adapté. Devis gratuit et sans engagement.`,
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
<section class="page-hero">
  <div class="container">
    ${bc.html}
    <div class="page-hero-narrow">
      <h1 class="h1">Zone d’intervention : Paris et toute l’Île-de-France</h1>
      <p class="lead">Nous intervenons sur vos projets de rénovation à Paris et dans les huit départements franciliens. Indiquez simplement votre code postal dans votre demande.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="h2">Île-de-France</h2>
    <p class="section-intro">Paris, la petite couronne et la grande couronne : un seul contact pour toute la région.</p>
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
    title: "Zone d’intervention : Paris et toute l’Île-de-France | Nexora Travaux",
    description:
      "Nexora Travaux intervient sur vos projets de rénovation à Paris (75) et dans toute l’Île-de-France : 77, 78, 91, 92, 93, 94 et 95. Devis gratuit.",
    current: "zone",
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
  <div class="container">
    ${bc.html}
    <div class="contact-grid">
      <div class="contact-copy">
        <p class="eyebrow eyebrow-light">Devis gratuit</p>
        <h1 class="h1">Parlons de ce que vous voulez transformer.</h1>
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
    description:
      "Décrivez votre projet en 3 étapes et envoyez-le sur WhatsApp : nous organisons la visite et l’entreprise réalisatrice vous transmet un devis détaillé. Gratuit et sans engagement.",
    body,
    jsonld: [bc.ld],
  });
}

/* ------------------------------------------------------------------ */

const fmt = (n) => n.toLocaleString("fr-FR");
const referralFaq = [
  [
    "Combien puis-je gagner ?",
    `${P.rate} % du montant HT des travaux signés par la personne que vous avez recommandée (${P.bonusRate} % à partir de votre 3e chantier signé dans l’année), avec un minimum de ${P.min} € et un maximum de ${fmt(P.max)} € par chantier. Exemple : une rénovation de salle de bain à 12 000 € HT vous rapporte ${fmt(Math.round(12000 * P.rate / 100))} €.`,
  ],
  [
    "Quand suis-je payé ?",
    `Par virement, dans les ${P.delai} qui suivent le paiement du chantier par le client. Vous êtes tenu informé de l’avancement sur WhatsApp.`,
  ],
  [
    "La personne que je recommande paie-t-elle plus cher ?",
    "Non. Votre récompense est prise sur la rémunération de Nexora, jamais ajoutée à la facture de votre proche. Il bénéficie du même devis gratuit, des mêmes prix négociés et du même suivi.",
  ],
  [
    "Comment Nexora sait-il que le client vient de moi ?",
    "Partagez votre lien personnel : votre code est automatiquement ajouté au message de votre proche. Il peut aussi simplement donner votre nom ou votre code lors de sa demande.",
  ],
  [
    "Dois-je avoir un statut d’entreprise ?",
    "Pas pour recommander occasionnellement. Les sommes perçues sont toutefois des revenus à déclarer aux impôts. Si vous recommandez régulièrement, un statut de micro-entrepreneur est conseillé. Un contrat d’apporteur d’affaires simple est signé avant votre premier versement.",
  ],
];

function referralPage() {
  const bc = breadcrumb([
    ["Accueil", "/"],
    ["Parrainage", "/parrainage/"],
  ]);
  const ex = [5000, 12000, 25000, 50000].map((v) => [v, Math.min(P.max, Math.max(P.min, Math.round((v * P.rate) / 100)))]);
  const body = `
<section class="page-hero referral-hero">
  <div class="container">
    ${bc.html}
    <div class="page-hero-grid">
      <div>
        <p class="eyebrow eyebrow-light">Programme apporteurs Nexora</p>
        <h1 class="h1">Recommandez Nexora. <span class="accent">Gagnez jusqu’à ${fmt(P.max)}&nbsp;€ par chantier.</span></h1>
        <p class="lead">Un proche, un voisin, un client a un projet de travaux&#8239;? Mettez-le en relation avec Nexora&#8239;: dès que son chantier est signé et réglé, vous touchez <strong>${P.rate}&nbsp;% du montant des travaux</strong>.</p>
        <div class="hero-actions">
          <a class="btn btn-whatsapp btn-lg" href="#lien">${icon("arrow")}Créer mon lien de parrainage</a>
          <a class="link-light" href="#simulateur">Calculer mes gains ${icon("arrow")}</a>
        </div>
      </div>
      <aside class="aside-card referral-examples">
        <h2 class="h4">Exemples de gains</h2>
        <ul>
          ${ex.map(([v, g]) => `<li><span>Chantier de ${fmt(v)}&nbsp;€</span><strong>${fmt(g)}&nbsp;€</strong></li>`).join("")}
        </ul>
        <p>Calculés à ${P.rate}&nbsp;% du montant HT, plafonnés à ${fmt(P.max)}&nbsp;€.</p>
      </aside>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Comment ça marche</p>
      <h2 class="h2">Trois étapes, aucune démarche compliquée.</h2>
    </div>
    <ol class="ref-steps">
      <li class="reveal"><span class="ref-num">01</span>${icon("user")}<h3>Créez votre lien</h3><p>Indiquez votre prénom ci-dessous&#8239;: votre code personnel est créé en un instant. Activez-le en un message WhatsApp.</p></li>
      <li class="reveal"><span class="ref-num">02</span>${icon("whatsapp")}<h3>Partagez-le</h3><p>Envoyez votre lien à vos proches, voisins ou clients qui ont un projet. Ils peuvent aussi simplement donner votre nom.</p></li>
      <li class="reveal"><span class="ref-num">03</span>${icon("check")}<h3>Soyez payé</h3><p>Chantier signé et réglé&#8239;? Vous recevez ${P.rate}&nbsp;% du montant HT par virement, sous ${P.delai}.</p></li>
    </ol>
  </div>
</section>

<section class="section section-paper" id="simulateur">
  <div class="container sim-grid">
    <div class="reveal">
      <p class="eyebrow">Simulateur</p>
      <h2 class="h2">Combien pouvez-vous gagner&#8239;?</h2>
      <p class="section-intro">Faites glisser le curseur selon le montant estimé des travaux de la personne que vous recommandez.</p>
      <ul class="win-list">
        <li>${icon("check")}<span><strong>Vous</strong> êtes récompensé pour un simple conseil.</span></li>
        <li>${icon("check")}<span><strong>Votre proche</strong> profite du devis gratuit, de prix négociés et d’un suivi complet, <em>sans payer plus cher</em>.</span></li>
        <li>${icon("check")}<span><strong>Les artisans</strong> reçoivent des chantiers sérieux et bien préparés.</span></li>
      </ul>
    </div>
    <div class="sim-card reveal" data-sim data-rate="${P.rate}" data-bonus="${P.bonusRate}" data-min="${P.min}" data-max="${P.max}">
      <label class="sim-label" for="sim-range">Montant des travaux</label>
      <output class="sim-amount" for="sim-range" data-sim-amount>12&nbsp;000&nbsp;€</output>
      <input id="sim-range" type="range" min="2000" max="80000" step="1000" value="12000" data-sim-range>
      <div class="sim-scale"><span>2&nbsp;000&nbsp;€</span><span>80&nbsp;000&nbsp;€</span></div>
      <label class="sim-toggle"><input type="checkbox" data-sim-bonus><span class="switch"></span><span class="sim-toggle-text">À partir de mon 3<sup>e</sup> chantier dans l’année (${P.bonusRate}&nbsp;%)</span></label>
      <div class="sim-result">
        <span>Vous gagnez</span>
        <strong data-sim-gain>${fmt(Math.round(12000 * P.rate / 100))}&nbsp;€</strong>
      </div>
      <p class="sim-note">Estimation indicative, calculée sur le montant HT signé. Minimum ${P.min}&nbsp;€, maximum ${fmt(P.max)}&nbsp;€ par chantier.</p>
    </div>
  </div>
</section>

<section class="section section-ink section-contact" id="lien">
  <div class="container contact-grid">
    <div class="contact-copy reveal">
      <p class="eyebrow eyebrow-light">Votre lien personnel</p>
      <h2 class="h2">Créez votre lien en 10 secondes.</h2>
      <p>Gratuit et sans engagement. Votre code est ajouté automatiquement aux demandes de vos proches.</p>
      <h3 class="h4 who-title">Idéal pour</h3>
      <ul class="who-list">
        <li>Famille, amis, voisins</li><li>Agents immobiliers</li><li>Gardiens et syndics</li><li>Architectes et décorateurs</li><li>Artisans (autres métiers)</li><li>Commerçants du quartier</li>
      </ul>
    </div>
    <div class="form-card ref-card" data-ref-gen>
      <div class="field">
        <label for="ref-name">Votre prénom</label>
        <input id="ref-name" autocomplete="given-name" placeholder="Ex. Sophie" maxlength="30">
      </div>
      <button class="btn btn-primary btn-lg" type="button" data-ref-create>Créer mon lien</button>
      <div class="ref-out" data-ref-out hidden>
        <p class="ref-out-label">Votre code&#8239;: <strong data-ref-code></strong></p>
        <div class="ref-link"><input readonly data-ref-link aria-label="Votre lien de parrainage"><button class="btn btn-outline" type="button" data-ref-copy>${icon("copy")}Copier</button></div>
        <a class="btn btn-whatsapp btn-lg" data-ref-activate href="#" rel="noopener">${icon("whatsapp")}1. Activer mon code auprès de Mickaël</a>
        <a class="btn btn-outline btn-lg" data-ref-share href="#" rel="noopener">${icon("chat")}2. Partager mon lien sur WhatsApp</a>
        <p class="form-note">Votre code devient actif dès que Mickaël l’a enregistré (étape 1).</p>
      </div>
      <p class="form-error" role="alert" hidden></p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container faq-grid">
    <div class="reveal">
      <p class="eyebrow">Questions fréquentes</p>
      <h2 class="h2">Tout savoir sur le parrainage.</h2>
      <details class="conditions">
        <summary>Conditions du programme</summary>
        <ul>
          <li>La personne recommandée est un nouveau client, qui n’était pas déjà en contact avec Nexora.</li>
          <li>La récompense est due une fois le chantier signé <strong>et</strong> réglé par le client.</li>
          <li>Montant&#8239;: ${P.rate}&nbsp;% du montant HT des travaux (${P.bonusRate}&nbsp;% à partir du 3<sup>e</sup> chantier signé dans l’année civile), minimum ${P.min}&nbsp;€, maximum ${fmt(P.max)}&nbsp;€ par chantier.</li>
          <li>Un chantier ne donne lieu qu’à une seule récompense&#8239;: celle de la première personne mentionnée.</li>
          <li>Il n’est pas possible de se recommander soi-même.</li>
          <li>Versement par virement sous ${P.delai} après paiement, après signature d’un contrat d’apporteur d’affaires.</li>
          <li>Les sommes perçues sont à déclarer par l’apporteur auprès de l’administration fiscale.</li>
          <li>Nexora peut faire évoluer le programme&#8239;; les recommandations déjà enregistrées restent aux conditions en vigueur au moment de leur enregistrement.</li>
        </ul>
      </details>
    </div>
    ${faqHtml(referralFaq)}
  </div>
</section>`;
  return page({
    path: "/parrainage/",
    title: `Parrainage : gagnez ${P.rate} % en recommandant Nexora Travaux`,
    description: `Recommandez Nexora Travaux à un proche qui a un projet de travaux en Île-de-France et touchez ${P.rate} % du montant de son chantier, jusqu’à ${fmt(P.max)} €. Sans frais pour lui.`,
    current: "parrainage",
    body,
    jsonld: [bc.ld, faqLd(referralFaq)],
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
<section class="page-hero page-hero-tight"><div class="container">${breadcrumb([["Accueil", "/"], ["Confidentialité", "/confidentialite/"]]).html}</div></section>
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
    ["parrainage/index.html", referralPage(), "/parrainage/", "0.7"],
    ["mentions-legales/index.html", legalPage(), "/mentions-legales/", "0.2"],
    ["confidentialite/index.html", privacyPage(), "/confidentialite/", "0.2"],
    ["404.html", notFound(), null, null],
  ];
}
