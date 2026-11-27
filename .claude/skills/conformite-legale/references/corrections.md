# Guide des corrections

Comment corriger chaque type de problème selon la stack. Principes :
- **Corriger dans la stack existante** : utiliser les conventions du projet (composants, styles, i18n, routes). Ne pas ajouter de framework pour une page légale.
- **Une correction = un problème** : petites modifications ciblées, faciles à relire.
- **Ne jamais casser le site** : après chaque lot, build et tests du projet s'ils existent.
- **Ne jamais inventer de données d'identité** : marqueurs `[À COMPLÉTER : …]`.
- **Corrections risquées** (montée de version majeure, changement d'authentification, migration de données) : les proposer, ne pas les appliquer sans accord spécifique.

## Sommaire
1. Pages légales · 2. Bandeau et blocage des traceurs · 3. Services tiers · 4. Formulaires et données · 5. Vente et abonnements · 6. Dark patterns · 7. Accessibilité · 8. Sécurité · 9. E-mails

---

## 1. Pages légales

| Stack | Où créer |
|---|---|
| Next.js App Router | `app/mentions-legales/page.tsx`, `app/confidentialite/page.tsx`, etc. + `export const metadata = { title: … }` |
| Next.js Pages Router | `pages/mentions-legales.tsx` |
| Nuxt | `pages/mentions-legales.vue` |
| SvelteKit | `src/routes/mentions-legales/+page.svelte` |
| Astro | `src/pages/mentions-legales.astro` ou `.md` |
| Remix / React Router | route correspondante |
| Vite + React Router | composant + route |
| HTML statique | `mentions-legales.html` avec le même gabarit (en-tête, pied de page) |
| WordPress | pages via l'éditeur (fournir le texte), page de confidentialité native dans Réglages > Confidentialité |
| Shopify | Réglages > Politiques (remboursement, confidentialité, CGV, mentions) |
| Mobile | écran « Informations légales » dans les paramètres + URL web |

Si le projet a de l'i18n, crée la version française (obligatoire en France) et les autres langues gérées.
Ajoute les liens dans le **pied de page** commun à toutes les pages.

## 2. Bandeau et blocage des traceurs

1. Choisir : outil existant dans le projet > outil libre léger (`vanilla-cookieconsent` d'orestbida, tarteaucitron.js, Klaro) > outil SaaS si l'utilisateur en a un.
2. **Bloquer à la source**. Exemples :
   - **Next.js** : ne pas mettre `<Script src="gtag">` ou `<GoogleAnalytics>` directement dans le layout ; créer un composant client qui ne le rend que si `consent.analytics === true`.
   - **HTML** : `<script type="text/plain" data-category="analytics" src="…">` (activé par vanilla-cookieconsent ou tarteaucitron).
   - **Google Tag Manager** : Consent Mode v2 en mode basic, ou GTM chargé uniquement après consentement ; défauts `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization` à `denied`.
   - **Mobile** : initialiser les SDK (Firebase Analytics, Facebook, AppsFlyer) seulement après consentement ; désactiver la collecte automatique (`FirebaseAnalytics.setAnalyticsCollectionEnabled(false)` par défaut, `FacebookAutoLogAppEventsEnabled=false`, etc.).
3. Lien « Gérer mes cookies » dans le pied de page (`CookieConsent.showPreferences()` ou équivalent).
4. Au retrait : supprimer les cookies concernés (`_ga`, `_ga_*`, `_fbp`…) et recharger la page si nécessaire.
5. Remplacer Google Analytics par un outil exemptable (Matomo configuré selon la CNIL, Plausible, etc.) si l'utilisateur préfère éviter le bandeau pour l'audience : à **proposer**, pas à imposer.

## 3. Services tiers

- **Google Fonts** → auto-hébergement : `next/font/google` (télécharge au build, rien n'est chargé depuis Google au runtime), `@fontsource/<police>`, `@nuxt/fonts`, ou fichiers `.woff2` dans `public/fonts` + `@font-face`. Supprimer les `<link href="fonts.googleapis.com">`.
- **YouTube, Vimeo, Maps, réseaux sociaux** → composant « click-to-load » : image d'aperçu locale + bouton « Afficher la vidéo (YouTube dépose des cookies) » ; ou chargement conditionnel à la catégorie « contenus intégrés » du bandeau. `lite-youtube-embed` n'est pas suffisant seul (il charge YouTube au clic, ce qui est bien, mais informer l'utilisateur).
- **reCAPTCHA** → proposer Cloudflare Turnstile, Friendly Captcha, hCaptcha ou un pot de miel.
- **Chat (Intercom, Crisp…)** → chargement après consentement ou au clic sur un bouton « Ouvrir le chat ».

## 4. Formulaires et données

- Ajouter sous le formulaire une mention d'information (texte dans `rgpd-cookies.md` §4) avec lien vers la politique.
- Retirer `checked` / `defaultChecked` des cases de consentement ; séparer l'acceptation des CGV de l'inscription à la newsletter.
- Supprimer les champs non nécessaires (ou les rendre facultatifs et signalés).
- **Suppression de compte** : bouton dans les paramètres du compte → confirmation → route serveur qui supprime (ou anonymise) l'utilisateur et ses données liées, révoque les sessions, et supprime chez les sous-traitants si possible (Stripe customer, liste e-mail). Conserver seulement ce que la loi impose (factures).
- **Exercice des droits** : au minimum une adresse e-mail dédiée dans la politique ; idéalement export des données (JSON) depuis le compte.
- **Purge** : tâche planifiée (cron, fonction planifiée de l'hébergeur) qui supprime les comptes inactifs, messages de contact anciens, journaux expirés, selon les durées annoncées.

## 5. Vente et abonnements

- Libellé du bouton final : « Commander avec obligation de paiement » ou « Payer [montant] ».
- Récapitulatif avant paiement : produits, quantités, prix TTC, livraison, total ; lien « Modifier ».
- Case d'acceptation des CGV (non pré-cochée) avant le paiement.
- E-mail de confirmation avec récapitulatif, CGV en pièce jointe ou lien vers la version datée, et lien vers la fonction de rétractation.
- **Fonction de rétractation** : page `/retractation` (et lien dans l'e-mail et l'espace client), formulaire (nom, numéro de commande, e-mail de réception), bouton « Confirmer la rétractation », envoi d'un accusé de réception horodaté, notification au vendeur.
- **Résiliation** : bouton « Résilier votre contrat » dans l'espace client et dans le pied de page ; avec Stripe : Customer Portal configuré pour autoriser l'annulation, ou route `subscriptions.update(id, { cancel_at_period_end: true })` ; e-mail d'accusé de réception avec date d'effet.
- Prix barrés : calculer le prix de référence à partir de l'historique des prix (30 jours), sinon retirer le prix barré.

## 6. Dark patterns

- Minuteurs factices et stocks aléatoires : supprimer, ou brancher sur une vraie date de fin et le vrai stock.
- Libellés culpabilisants : remplacer par « Non merci ».
- Options ajoutées par défaut : décocher.
- Boutons asymétriques : même composant et même variante pour « Accepter » et « Refuser ».

## 7. Accessibilité

- **Images** : `alt` décrivant l'information (pas « image de… ») ; `alt=""` pour les images décoratives ; pour les icônes seules dans un bouton, `aria-label` sur le bouton. Si le contenu de l'image n'est pas connu, mettre un `alt` provisoire et le lister dans « À compléter ».
- **Contrastes** : corriger dans les jetons de design (variables CSS, configuration Tailwind) plutôt que composant par composant ; `scripts/contrast.py` calcule le ratio et propose une couleur proche conforme.
- **Focus** : supprimer les `outline: none` sans alternative ; ajouter `:focus-visible { outline: 2px solid <couleur contrastée>; outline-offset: 2px; }`.
- **Clavier** : éléments cliquables = `<button>` ou `<a href>`, pas des `<div onClick>` (sinon `role`, `tabindex="0"` et gestion de Entrée et Espace) ; menus et modales : piège du focus dans la modale, Échap pour fermer, retour du focus au déclencheur.
- **Lien d'évitement** : « Aller au contenu » en premier élément focusable, vers `<main id="contenu">`.
- **Formulaires** : `<label for>` ou `aria-label` ; erreurs avec `aria-describedby` et `aria-invalid` ; `autocomplete` sur les champs personnels (`email`, `name`, `street-address`…).
- **Structure** : `<html lang="fr">`, un seul `h1`, pas de saut de niveau, repères `header`/`nav`/`main`/`footer`.
- **Médias** : sous-titres (`<track kind="captions">`), pas d'`autoplay` avec son, contrôles de pause pour les carrousels et animations ; respecter `prefers-reduced-motion`.

## 8. Sécurité

En-têtes selon l'hébergeur :
- **Next.js** : `headers()` dans `next.config.js` (ou middleware pour une CSP avec nonce).
- **Vercel** : `vercel.json` → `"headers"`.
- **Netlify** / **Cloudflare Pages** : fichier `_headers`.
- **Nginx** : `add_header … always;`.
- **Apache** : `.htaccess` avec `Header always set`.
- **Express** : `helmet`.
- **Django** : `SECURE_*` dans les réglages, `django-csp`.
- **Laravel** : middleware dédié.
**Redirection `http://` → `https://`** (toutes les variantes : avec et sans `www`) :
- **Cloudflare** : *SSL/TLS > Edge Certificates > Always Use HTTPS* ; pour `www` → adresse principale, une règle de redirection (*Rules > Redirect Rules*) et un enregistrement DNS `www` proxifié.
- **Vercel, Netlify, GitHub Pages** (HTTPS forcé coché), **Firebase** : automatique ; ajouter le domaine `www` et le faire rediriger vers l'adresse principale dans les réglages de domaine.
- **Nginx** : bloc `server { listen 80; server_name exemple.fr www.exemple.fr; return 301 https://exemple.fr$request_uri; }`.
- **Apache** : `.htaccess` avec `RewriteCond %{HTTPS} off` puis `RewriteRule ^ https://exemple.fr%{REQUEST_URI} [L,R=301]`.
- **Next.js** (`middleware.ts` / `proxy.ts`) : en dernier recours seulement, si l'hébergeur ne le fait pas.
- HSTS seul ne protège pas la toute première visite : ajouter `preload` et inscrire le domaine sur hstspreload.org quand tous les sous-domaines sont en HTTPS.

**Adresses inconnues qui font planter le site** (`check_headers.py --probe-files` signale une 5xx ou une lenteur) : répondre 404 tout de suite aux chemins de fichiers inconnus (`/.git/*`, `*.php`, `*.env`, `*.yml`) avant tout traitement (middleware, règle de l'hébergeur ou du pare-feu), et ne pas déclencher d'alerte pour ces 404.

Commencer la CSP en mode `Content-Security-Policy-Report-Only` si le site charge beaucoup de tiers, puis passer en mode bloquant.

Autres corrections : voir `securite-owasp.md` (chaque point a sa section « Corriger »). Pour une clé exposée : **demander à l'utilisateur de la révoquer** chez le fournisseur, puis la déplacer en variable d'environnement serveur.

Dépendances : `npm audit fix` (sans `--force`) ; les montées de version majeures sont proposées une par une avec un build et des tests.

## 9. E-mails

- Gabarits marketing (dossiers `emails/`, `templates/`, React Email, MJML, outils comme Brevo ou Mailchimp) : lien de désinscription en un clic + en-tête `List-Unsubscribe` (et `List-Unsubscribe-Post`) côté envoi.
- Identité et adresse de l'expéditeur dans le pied de l'e-mail.
- E-mails transactionnels (confirmation de commande) : pas de lien de désinscription requis, mais ne pas y glisser de prospection sans consentement.

**L'adresse de contact ne reçoit rien** (`check_email.py` : pas de MX) : créer la boîte chez l'hébergeur d'e-mail, ou une redirection (Cloudflare Email Routing, redirection du registrar) vers la boîte réelle ; puis citer ce service et la boîte de réception dans la politique de confidentialité.

**Le formulaire dit « envoyé » mais rien n'arrive** :
- vérifier dans le code la réponse du service d'envoi (Resend renvoie `{ data, error }` sans lever d'erreur ; `fetch` ne lève rien sur une 4xx/5xx) et afficher une erreur au visiteur si l'envoi échoue ;
- regarder la **liste de blocage** du service d'envoi : après un rebond (adresse inexistante pendant un changement de DNS, boîte pleine), l'adresse y est ajoutée et plus rien ne part (Resend > Emails > Suppressions ; équivalent chez Brevo, Postmark, SendGrid) ; retirer l'adresse une fois le problème réglé ;
- vérifier le quota de l'offre gratuite (Resend : 100 e-mails par jour) : des alertes en boucle peuvent l'épuiser.

**Les e-mails du site arrivent dans les spams** (domaine neuf, redirection) — ce n'est pas un point légal, mais un délai de réponse promis sur le site devient intenable :
- SPF (un seul enregistrement, `~all` ou `-all`), DKIM du service d'envoi, DMARC : commencer par `p=none; rua=mailto:…` (rapports), puis `p=quarantine` quand tout est aligné ;
- dans Gmail, créer un filtre « De : @domaine → Ne jamais envoyer dans le spam » ;
- répondre depuis l'adresse du domaine (Gmail « Envoyer en tant que » avec le SMTP du service d'envoi) plutôt que depuis l'adresse Gmail ;
- éviter les messages de test « bidon » (« test test », liens raccourcis) qui ressemblent à du spam.
