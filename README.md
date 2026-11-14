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

## Formulaire de devis

Aucune donnée n’est stockée : le formulaire ouvre WhatsApp (ou les SMS sur mobile) avec un message
pré-rempli que le visiteur relit avant envoi. `/devis/?metier=plomberie` pré-sélectionne un métier.

## Mise en ligne (Cloudflare Pages)

- Commande de build : `node build.mjs`
- Dossier de sortie : `dist`
- Rediriger `www.nexoratravaux.fr` vers `nexoratravaux.fr` (règle de redirection Cloudflare).

## À compléter

Les mentions légales et la politique de confidentialité contiennent des champs surlignés
`[À compléter]` (nom, statut, SIRET, adresse) à renseigner dès que l’entreprise est immatriculée.
