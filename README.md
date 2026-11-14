# Nexora Travaux — nexoratravaux.fr

Site vitrine statique (HTML/CSS/JS, sans framework), rapide et optimisé pour le référencement local.

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

## Parrainage

Page `/parrainage/` : simulateur de gains, création d’un lien personnel (`/?ref=CODE`), conditions.
Le taux, le plafond et le délai se règlent dans `src/data.mjs` (objet `parrainage`).
Le code d’un visiteur arrivé par un lien est mémorisé 90 jours et ajouté au message WhatsApp
(« Recommandé par : CODE »). Un apporteur active son code en l’envoyant à Mickaël sur WhatsApp.

## Formulaire de devis

Aucune donnée n’est stockée : le formulaire ouvre WhatsApp (ou les SMS sur mobile) avec un message
pré-rempli que le visiteur relit avant envoi. `/devis/?metier=plomberie` pré-sélectionne un métier.

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
