/*
 * browser_probe.js — sonde de conformité à exécuter DANS la page testée.
 *
 * Usage :
 *  - avec un outil navigateur (Claude in Chrome, navigateur intégré, Playwright MCP…) :
 *    exécuter le contenu de ce fichier comme expression JavaScript ; il renvoie un objet JSON ;
 *  - dans la console du navigateur : coller le fichier, le résultat s'affiche ;
 *  - avec live_check.mjs (Playwright) : chargé automatiquement.
 *
 * À lancer sur une session NEUVE (navigation privée, aucun choix de cookies fait)
 * pour le test « avant consentement », puis après un refus.
 *
 * Limites : document.cookie ne voit pas les cookies HttpOnly (live_check.mjs, lui,
 * les voit) ; le contraste n'est pas calculable sur une image de fond.
 */
(() => {
  const MAX = 40;
  const host = location.hostname.replace(/^www\./, "");
  const sameSite = (h) => { h = h.replace(/^www\./, ""); return h === host || h.endsWith("." + host) || host.endsWith("." + h); };

  // --- Services tiers connus ---
  const KNOWN = [
    [/google-analytics\.com|googletagmanager\.com\/gtag|analytics\.google\.com/, "Google Analytics", "consentement"],
    [/googletagmanager\.com\/gtm/, "Google Tag Manager", "selon balises"],
    [/doubleclick\.net|googleadservices|googlesyndication|google\.com\/pagead/, "Google Ads", "consentement"],
    [/facebook\.net|facebook\.com\/tr/, "Meta Pixel", "consentement"],
    [/tiktok\.com/, "TikTok", "consentement"],
    [/licdn\.com|linkedin\.com\/px/, "LinkedIn", "consentement"],
    [/hotjar|clarity\.ms|fullstory|mouseflow|logrocket/, "Analyse comportementale", "consentement"],
    [/criteo|taboola|outbrain|adnxs|pinimg|ads-twitter|sc-static\.net/, "Publicité", "consentement"],
    [/youtube\.com|ytimg\.com|vimeo\.com/, "Vidéo intégrée", "consentement ou clic"],
    [/maps\.googleapis|maps\.gstatic|google\.com\/maps/, "Google Maps", "consentement ou clic"],
    [/fonts\.googleapis|fonts\.gstatic/, "Google Fonts", "héberger en local"],
    [/recaptcha|gstatic\.com\/recaptcha/, "reCAPTCHA", "à évaluer"],
    [/intercom|crisp\.chat|hs-scripts|hubspot|zdassets|tawk\.to|tidio/, "Chat / CRM", "consentement en général"],
    [/stripe\.com|paypal\.com/, "Paiement", "nécessaire"],
    [/matomo|piwik|plausible\.io|usefathom|simpleanalytics|umami|cloudflareinsights|vercel-insights|vitals\.vercel/, "Mesure d'audience", "selon configuration"],
    [/sentry/, "Sentry", "intérêt légitime possible"],
    [/axept\.io|didomi|tarteaucitron|cookiebot|onetrust|cookielaw|usercentrics|iubenda/, "Outil de consentement", "nécessaire"],
  ];
  const classify = (url) => { for (const [rx, name, consent] of KNOWN) if (rx.test(url)) return { service: name, consentement: consent }; return { service: "inconnu", consentement: "à identifier" }; };

  const thirdParty = {};
  for (const e of performance.getEntriesByType("resource")) {
    let u; try { u = new URL(e.name); } catch { continue; }
    if (!/^https?:/.test(u.protocol) || sameSite(u.hostname)) continue;
    const key = u.hostname;
    if (!thirdParty[key]) thirdParty[key] = { domaine: key, ...classify(e.name), requetes: 0, exemple: e.name.slice(0, 140) };
    thirdParty[key].requetes++;
  }
  const iframes = [...document.querySelectorAll("iframe")].map((f) => ({ src: (f.src || f.dataset.src || "").slice(0, 140), ...classify(f.src || "") }));

  // --- Cookies et stockage ---
  const cookies = document.cookie ? document.cookie.split(";").map((c) => c.split("=")[0].trim()).filter(Boolean) : [];
  const storage = (s) => { try { return Object.keys(s); } catch { return []; } };

  // --- Utilitaires d'accessibilité ---
  const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && cs.opacity !== "0"; };
  const desc = (el) => { let s = el.tagName.toLowerCase(); if (el.id) s += "#" + el.id; else if (el.className && typeof el.className === "string") s += "." + el.className.trim().split(/\s+/).slice(0, 2).join("."); return s; };
  const accName = (el) => {
    const t = (el.getAttribute("aria-label") || "").trim(); if (t) return t;
    const lb = el.getAttribute("aria-labelledby"); if (lb) { const n = lb.split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" ").trim(); if (n) return n; }
    if (el.labels && el.labels.length) { const n = [...el.labels].map((l) => l.textContent).join(" ").trim(); if (n) return n; }
    const txt = (el.innerText || el.textContent || "").trim(); if (txt && !/^(input|select|textarea)$/i.test(el.tagName)) return txt;
    const img = el.querySelector && el.querySelector("img[alt]:not([alt=''])"); if (img) return img.alt;
    return (el.getAttribute("title") || "").trim();
  };

  // Images
  const imgs = [...document.images].filter(visible);
  const imgNoAlt = imgs.filter((i) => !i.hasAttribute("alt")).slice(0, MAX).map((i) => (i.currentSrc || i.src).slice(0, 120));
  const imgBadAlt = imgs.filter((i) => i.hasAttribute("alt") && /\.(png|jpe?g|webp|svg|gif)$|^(image|img|photo|logo)$/i.test(i.alt.trim())).slice(0, MAX).map((i) => ({ src: (i.currentSrc || i.src).slice(0, 100), alt: i.alt }));

  // Champs et boutons sans nom accessible
  const fields = [...document.querySelectorAll("input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea")].filter(visible);
  const fieldsNoLabel = fields.filter((f) => !accName(f)).slice(0, MAX).map((f) => ({ champ: desc(f), type: f.type, placeholder: f.placeholder || "" }));
  const controls = [...document.querySelectorAll("button, a[href], [role=button], [role=link]")].filter(visible);
  const controlsNoName = controls.filter((c) => !accName(c)).slice(0, MAX).map(desc);
  const clickableDivs = [...document.querySelectorAll("div[onclick], span[onclick]")].filter((d) => !d.hasAttribute("tabindex") || !d.getAttribute("role")).slice(0, MAX).map(desc);

  // Structure
  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(visible).map((h) => +h.tagName[1]);
  const headingSkips = [];
  headings.forEach((lvl, i) => { if (i && lvl > headings[i - 1] + 1) headingSkips.push(`h${headings[i - 1]} → h${lvl}`); });
  const landmarks = { header: !!document.querySelector("header,[role=banner]"), nav: !!document.querySelector("nav,[role=navigation]"), main: !!document.querySelector("main,[role=main]"), footer: !!document.querySelector("footer,[role=contentinfo]") };
  const viewport = document.querySelector("meta[name=viewport]")?.content || "";
  const skipLink = [...document.querySelectorAll("a[href^='#']")].slice(0, 3).some((a) => /contenu|content|main|aller/i.test(a.textContent));

  // Contrastes
  const parseRGB = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const L = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const bgOf = (el) => {
    let layers = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return null; // indéterminable
      const c = parseRGB(cs.backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base);
    return base;
  };
  const contrastFails = []; let contrastChecked = 0, contrastUnknown = 0;
  const textEls = [...document.querySelectorAll("body *")].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1) && visible(el));
  for (const el of textEls.slice(0, 600)) {
    const cs = getComputedStyle(el); const fg = parseRGB(cs.color); const bg = bgOf(el);
    if (!fg || !bg) { contrastUnknown++; continue; }
    const f = fg.a < 1 ? blend(fg, bg) : fg;
    const l1 = L(f), l2 = L(bg); const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const size = parseFloat(cs.fontSize); const bold = +cs.fontWeight >= 700;
    const large = size >= 24 || (bold && size >= 18.66); const need = large ? 3 : 4.5;
    contrastChecked++;
    if (ratio < need && contrastFails.length < MAX) contrastFails.push({ element: desc(el), texte: el.textContent.trim().slice(0, 40), ratio: +ratio.toFixed(2), seuil: need, couleur: cs.color, fond: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})` });
  }

  // Cases pré-cochées
  const prechecked = [...document.querySelectorAll("input[type=checkbox]")].filter((c) => c.checked && visible(c)).map((c) => ({ champ: desc(c), libelle: accName(c).slice(0, 80) }));

  // Bandeau cookies : comparer Accepter / Refuser
  const btns = [...document.querySelectorAll("button, a, [role=button], input[type=button], input[type=submit]")].filter(visible);
  const label = (b) => (b.innerText || b.value || b.getAttribute("aria-label") || "").trim();
  const accept = btns.filter((b) => /^(tout\s+)?accept|j['’]accepte|accepter|autoriser|allow all|agree|ok,? j/i.test(label(b)));
  const refuse = btns.filter((b) => /refus|reject|decline|continuer sans|deny|tout refuser|non merci/i.test(label(b)));
  const style = (b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return { texte: label(b).slice(0, 40), largeur: Math.round(r.width), hauteur: Math.round(r.height), taille_police: cs.fontSize, fond: cs.backgroundColor, couleur: cs.color, element: b.tagName.toLowerCase() }; };
  let banner = null;
  if (accept.length || refuse.length) {
    const a = accept[0] && style(accept[0]); const r = refuse[0] && style(refuse[0]);
    const issues = [];
    if (a && !r) issues.push("Bouton « Accepter » sans bouton « Refuser » visible au même niveau");
    if (a && r) {
      if (r.largeur * r.hauteur < 0.7 * a.largeur * a.hauteur) issues.push("« Refuser » nettement plus petit que « Accepter »");
      if (r.fond !== a.fond && /rgba\(0, 0, 0, 0\)|transparent/.test(r.fond)) issues.push("« Refuser » sans fond alors que « Accepter » en a un (mise en valeur inégale)");
      if (parseFloat(r.taille_police) < parseFloat(a.taille_police)) issues.push("Police de « Refuser » plus petite");
      if (r.element === "a" && a.element !== "a") issues.push("« Refuser » est un lien alors que « Accepter » est un bouton");
    }
    banner = { accepter: a || null, refuser: r || null, problemes: issues };
  }

  // Liens légaux présents sur la page
  const links = [...document.querySelectorAll("a")].map((a) => (a.innerText || "").trim().toLowerCase());
  const has = (rx) => links.some((t) => rx.test(t));
  const legalLinks = {
    mentions_legales: has(/mentions l[ée]gales|legal notice|imprint/),
    confidentialite: has(/confidentialit|donn[ée]es personnelles|privacy/),
    cookies: has(/cookies/),
    gerer_cookies: has(/g[ée]rer (mes |les )?cookies|param[èe]tres (des )?cookies|pr[ée]f[ée]rences (de )?cookies|cookie settings/),
    cgv: has(/\bcgv\b|conditions g[ée]n[ée]rales de vente/),
    cgu: has(/\bcgu\b|conditions g[ée]n[ée]rales d.utilisation|terms/),
    accessibilite: has(/accessibilit/),
  };

  const media = [...document.querySelectorAll("video[autoplay], audio[autoplay]")].map((m) => ({ element: desc(m), muet: m.muted }));

  return {
    url: location.href,
    lang: document.documentElement.lang || null,
    titre: document.title,
    traceurs: {
      cookies_visibles_js: cookies,
      localStorage: storage(localStorage),
      sessionStorage: storage(sessionStorage),
      domaines_tiers: Object.values(thirdParty),
      iframes,
    },
    bandeau_cookies: banner,
    liens_legaux: legalLinks,
    accessibilite: {
      images_sans_alt: imgNoAlt,
      alt_douteux: imgBadAlt,
      champs_sans_etiquette: fieldsNoLabel,
      boutons_liens_sans_nom: controlsNoName,
      elements_cliquables_non_accessibles: clickableDivs,
      contrastes: { verifies: contrastChecked, indetermines: contrastUnknown, echecs: contrastFails },
      titres: { nombre_h1: headings.filter((h) => h === 1).length, sauts: headingSkips },
      reperes: landmarks,
      lien_evitement: skipLink,
      viewport,
      zoom_bloque: /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/i.test(viewport),
      medias_autoplay: media,
    },
    formulaires: {
      nombre: document.forms.length,
      cases_precochees: prechecked,
    },
    limites: "Cookies HttpOnly invisibles ici ; contraste non calculé sur image de fond ; navigation clavier à tester séparément (Tab).",
  };
})();
