# Nexora Travaux — nexoratravaux.fr

Site vitrine statique et immersif (HTML/CSS/JS, sans framework ni librairie externe), rapide et optimisé pour le référencement local.

## Expérience immersive (accueil)

- Hero plein écran : photo en parallaxe, titre animé mot par mot, quadrillage « plan d’architecte » qui suit la souris, sceau rotatif « Devis gratuit »
- Scène « Sans Nexora / Avec Nexora » épinglée au défilement : les artisans éparpillés convergent vers Mikhael, contact unique
- Mot du fondateur avec conversation WhatsApp animée (exemple d’échange) et compteurs
- Configurateur de projet : projets types (salle de bain, cuisine…) qui sélectionnent les métiers, récapitulatif en direct relié au formulaire
- Méthode en défilement horizontal (grand écran), test de zone par code postal sur le radar
- Barre de contact mobile, bouton WhatsApp flottant, transitions entre pages (View Transitions)
- Tout reste lisible sans JavaScript ; les animations sont coupées si « réduire les animations » est activé

## Structure

```
build.mjs              → génère le site dans dist/
src/data.mjs           → contenus : téléphone, métiers, zones (à modifier ici)
src/pages.mjs          → pages (accueil, métiers, zone, devis, mentions légales…)
src/layout.mjs         → en-tête, pied de page, formulaire, SEO commun
src/assets/            → CSS, JS, polices, images
src/static/            → favicon, en-têtes HTTP (_headers)
```

## Commandes

```sh
node build.mjs       # génère dist/
npm run preview      # génère puis sert le site sur http://localhost:4321
```

## Pages générées

- `/` accueil
- `/metiers/<metier>/` × 8 (électricité, plomberie, menuiserie, peinture, sols, plâtrerie, carrelage, parquet)
- `/zone-intervention/`, `/devis/`, `/mentions-legales/`, `/confidentialite/`, `404.html`
- `sitemap.xml` et `robots.txt` générés automatiquement

## Formulaire de devis

Aucune donnée n’est stockée : le formulaire ouvre WhatsApp (ou les SMS, ou l’e-mail) avec un message
pré-rempli que le visiteur relit avant envoi. Il tient en 2 étapes : métiers (ou projet type), puis coordonnées.

Sur toutes les pages, les boutons « devis » ouvrent ce formulaire dans un panneau par-dessus la page
(`<dialog id="quote-sheet">`), sans défilement. Les raccourcis du haut de l’accueil et les liens
`/devis/?metier=plomberie` pré-cochent les métiers. Sans JavaScript, les liens mènent à la page `/devis/`.

## Mise en ligne (Netlify, domaine chez IONOS)

1. Netlify → « Add new site » → « Import from Git » → dépôt `azok95220/nexora`.
2. Build command : `node build.mjs` — Publish directory : `dist`.
3. Domain management → ajouter `nexoratravaux.fr` (et `www`).
4. Chez IONOS (Domaines & SSL → nexoratravaux.fr → DNS) : remplacer l’enregistrement A de `nexoratravaux.fr` par l’IP indiquée par Netlify,
   et faire pointer `www` (CNAME) vers l’adresse `xxx.netlify.app`. **Ne pas toucher aux enregistrements MX**
   (ils gèrent la boîte contact@nexoratravaux.fr).
5. Netlify active le HTTPS automatiquement.

## À compléter

Les mentions légales et la politique de confidentialité contiennent des champs surlignés
`[À compléter]` (nom, statut, SIRET, adresse) à renseigner dès que l’entreprise est immatriculée.

## Police de caractères

`src/assets/fonts/inter-latin.woff2` est une version allégée d’Inter, limitée aux caractères utilisés par le site
(alphabet latin, accents français, ponctuation). La police complète est conservée dans `tools/fonts/inter-full.woff2`.
Si un nouveau caractère spécial est ajouté au contenu et s’affiche dans une autre police, régénérer le sous-ensemble :

```sh
pip install fonttools brotli
pyftsubset tools/fonts/inter-full.woff2 --unicodes="U+0020-007E,U+00A0-00FF,U+0152,U+0153,U+2011-2026,U+202F,U+2032,U+2039,U+203A,U+20AC,U+2190-2193" \
  --flavor=woff2 --layout-features=kern,liga,calt,ccmp,locl,mark,mkmk,cv11,ss01,ss03,frac,sups \
  --output-file=src/assets/fonts/inter-latin.woff2
```
