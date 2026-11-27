---
name: conformite-legale
description: Audite, teste et corrige la conformité légale et la sécurité d'un site web, d'un e-commerce, d'un SaaS ou d'une appli mobile — France, Union européenne et monde. Grille de 52 points : 30 points légaux (mentions légales LCEN, RGPD, politique de confidentialité, cookies et bandeau CNIL, CGV/CGU, rétractation et bouton de rétractation, remboursement, médiateur, garanties, résiliation en 3 clics, dark patterns, faux avis, allégations, prospection e-mail, licences, accessibilité RGAA/EAA/WCAG, DSA, AI Act) + 15 points sécurité (OWASP Top 10 2025, en-têtes HTTP, secrets, API, IA) + 7 points hébergement et e-mail (offre gratuite autorisée pour un pro, contrat de données DPA, hébergeur réel, MX, SPF, DKIM, DMARC). Analyse le code, teste le site dans un vrai navigateur (traceurs avant consentement, contrastes, clavier), vérifie l'hébergeur et l'e-mail, analyse les applis mobiles (Flutter, React Native, Expo, Swift, Kotlin : SDK, consentement, ATT, permissions, règles App Store et Google Play), rédige un rapport simple par catégorie, puis corrige après validation et retest. Utilise ce skill dès que l'utilisateur veut déployer, lancer ou mettre en ligne un site ou une appli « en règle », « conforme », « sans risque juridique », ou parle de RGPD, GDPR, CNIL, App Store, Google Play, appli iOS ou Android, cookies, bandeau cookies, mentions légales, politique de confidentialité, CGV, CGU, RGAA, accessibilité, WCAG, DGCCRF, OWASP, sécurité avant mise en production, audit légal — même s'il ne demande pas explicitement un audit.
---

# Conformité légale et sécurité des sites et applis

Objectif : qu'un site ou une appli puisse être mis en ligne **sans exposer son éditeur à une sanction ou à une action en justice**. Le skill fait tout le cycle sur le projet réel de l'utilisateur, quelle que soit sa stack :

**Analyser → Tester → Rapport → Validation par l'utilisateur → Corriger → Retester**

## Règles de conduite

- **Rien n'est corrigé avant que l'utilisateur ait validé le rapport.** L'audit et les tests ne modifient pas le projet (hors fichiers de rapport). L'utilisateur peut valider tout, une partie (« corrige 1 à 10 »), ou rien.
- **Ne jamais inventer d'informations d'identité** (SIRET, adresse, capital, hébergeur, médiateur, directeur de publication). Laisser un marqueur `[À COMPLÉTER : …]`. Un faux SIRET dans des mentions légales engage l'éditeur.
- **Le droit appliqué par défaut est français et européen.** Les règles d'autres pays s'ajoutent seulement si le projet vise ces pays.
- **Tester uniquement le projet de l'utilisateur** : en local de préférence. Aucun test de sécurité actif sur un site en production ou sur un service tiers sans son accord explicite.
- **Tu n'es pas avocat.** Dis-le une fois dans le rapport, en précisant que le rapport n'est pas un conseil juridique, ne garantit pas la conformité et que l'éditeur reste seul responsable de son site, et indique précisément quand un juriste est nécessaire (activité réglementée, données de santé, mineurs, grosses volumétries, litige en cours). Ne noie pas chaque paragraphe d'avertissements.
- **Ne pas affirmer qu'un point est conforme sans l'avoir vérifié.** Si un test n'a pas pu être fait (pas de navigateur, site qui ne démarre pas), le statut est ❓ avec la raison.
- **Secret collé dans la conversation** (clé d'API, mot de passe, jeton) : ne pas l'utiliser ni le recopier ; demander à l'utilisateur de le **révoquer** et d'en créer un nouveau qu'il mettra lui-même dans les variables d'environnement ; ajouter une action 🗂️ « Vous » au rapport jusqu'à ce qu'il confirme. Aucun script ne le voit, puisqu'il n'est pas dans le code.

## Étape 1 — Cadrer (lire avant de demander)

Explore le projet : manifestes (`package.json`, `composer.json`, `pubspec.yaml`, `Podfile`…), routes et pages, pied de page, formulaires, scripts tiers, configuration d'hébergement, paiement, comptes, IA, e-mails, i18n. Pré-remplis tout ce que tu peux, puis pose **en un seul lot** les questions restantes :

| Question | Pourquoi |
|---|---|
| Statut de l'éditeur (particulier, EI/micro, société, association, public) et taille (< 10 salariés et < 2 M€ ? > 250 M€ de CA ?) | Mentions obligatoires, exemptions accessibilité, RGAA |
| Type (vitrine, blog, e-commerce, SaaS, marketplace, appli, contenus d'utilisateurs) et clients (B2C, B2B) | Blocs de règles applicables |
| Pays visés | Lois étrangères (`references/international.md`) |
| Mineurs ? Données sensibles ? Activité réglementée ? IA ? | Règles spécifiques, avis juridique |
| Comment lancer le site en local (commande, port) ou URL de préproduction | Indispensable pour les tests en navigateur |
| Informations d'identité disponibles (SIRET, hébergeur, médiateur…) | Pour remplir les pages sans rien inventer |
| **Offre d'hébergement utilisée** (gratuite ou payante, laquelle) | Une offre gratuite peut interdire l'usage commercial ou ne pas avoir de contrat de données (`references/hebergeurs.md`) |
| **Où arrivent les e-mails** du site et de l'adresse de contact (Gmail, Outlook, Workspace…) et quel service les envoie | Destinataires de données invisibles dans le code ; Gmail gratuit n'a pas de contrat de données |

Si l'utilisateur ne sait pas, prends l'hypothèse la plus protectrice et note-la.

## Étape 2 — Analyser le code

**Toutes les stacks** : les scripts lisent JS/TS, PHP (Twig, Blade, Latte), Python (Jinja, Django), Ruby (ERB, Slim, Haml), Java/Kotlin (JSP, Thymeleaf, FreeMarker), C# (Razor, Blazor), Go, Elixir, Rust, Swift, Dart et HTML. **Sans accès au code** (Shopify, Wix, Squarespace, Webflow, site d'un prestataire, site d'un prospect) : suis la section « Analyser le site d'un tiers » plus bas ; sinon, fais toute l'étape 3 sur l'URL en ligne (`live_check.mjs`, `check_headers.py`) et lis le texte de chaque page dans le navigateur à la place de `extract_texts.py` ; note dans le rapport que le code n'a pas été audité. Pour WordPress, audite aussi la liste des extensions actives (traceurs et bandeaux sont souvent des extensions).

Lance les analyses statiques (Python 3.8+, aucune dépendance) :

```bash
python3 <skill>/scripts/scan_trackers.py <projet>    # traceurs, bandeau, pages légales, services tiers
python3 <skill>/scripts/audit_static.py <projet>     # accessibilité, sécurité OWASP, dark patterns, allégations, e-mails, licences,
                                                     # limitation anti-abus en mémoire, alertes qui s'emballent, envoi d'e-mail non vérifié
python3 <skill>/scripts/audit_mobile.py <projet>     # SI c'est une appli : SDK et consentement, ATT, permissions, manifeste Apple,
                                                     # suppression du compte, liens légaux, stockage des jetons, API Android, accessibilité
```

**Appli mobile** (Flutter, React Native, Expo, Swift, Kotlin, Capacitor, Cordova, .NET MAUI, Kotlin Multiplatform) : lance aussi `audit_mobile.py`, lis `references/mobile.md`, ajoute les 7 points « Appli mobile et stores » (M1 à M7, grille de 59 points) et demande à l'utilisateur ce qu'il a déclaré sur les fiches des stores (« App Privacy », « Sécurité des données », statut de trader) et l'URL de sa politique de confidentialité. Si l'appli a aussi un site ou une API, audite-les comme d'habitude.

Puis audite les dépendances avec l'outil de la stack (`npm audit --omit=dev`, `pnpm audit`, `pip-audit`, `composer audit`…). Si `gitleaks` ou `trufflehog` sont installés, lance-les aussi.

Les scripts donnent des indices : **lis chaque occurrence importante** pour confirmer ou écarter. Les commentaires du code sont ignorés et les mots cités dans un texte (« OpenAI », « checkout ») ne comptent pas comme une intégration ; un constat restant peut quand même être un faux positif : écarte-le en le disant, ne le recopie pas tel quel dans le rapport.

## Étape 2 bis — Lecture intégrale (obligatoire)

Un script ne comprend pas le sens d'une phrase. **Chaque texte visible et chaque traitement de données doit être lu par toi**, pas échantillonné.

1. **Inventaire des textes** :
   ```bash
   python3 <skill>/scripts/extract_texts.py <projet> --out textes-visibles.md
   ```
   Il liste, fichier par fichier et ligne par ligne, toutes les phrases affichées (pages, composants, traductions, attributs `alt`/`aria-label`/`placeholder`, métadonnées, e-mails). Lis **toutes** les lignes, dans toutes les langues du site.
2. **Pour chaque phrase**, cherche :
   - **Allégation non prouvable** (point 23) : chiffres, scores, « garanti », « n°1 », délais promis, taille de l'entreprise (« notre équipe » pour un indépendant), certifications, clients ou résultats cités.
   - **Promesse contractuelle** : « devis gratuit sous 48 h », « remboursé », « sans engagement » — elle engage l'éditeur et doit être tenable et cohérente avec les CGV.
   - **Mentions obligatoires** (points 1, 7, 19) : comparer **mot à mot** avec l'immatriculation (Kbis/INSEE : nom, forme, adresse de l'établissement, RCS/RNE, TVA). Une adresse ou un RCS différent du Kbis est un constat.
   - **Dark patterns et pression** (point 21) : urgence, rareté, culpabilisation, consentement forcé.
   - **Accessibilité du libellé** (points 26, 29) : nom accessible cohérent avec le texte visible, liens explicites, langue.
   - **Marques et contenus tiers** (point 24) : logos, noms de marques, images, citations.
3. **Cartographie des données (RGPD/CNIL)** : liste **chaque** collecte ou envoi de données dans le code — formulaires, `fetch`/appels serveur, API tierces, e-mails, journaux (`console.log`, logger), adresse IP (limitation, statistiques), `localStorage`/`sessionStorage`/cookies, polices et scripts externes. Puis vérifie dans **les deux sens** :
   - tout ce que fait le code figure dans la politique de confidentialité (finalité, base légale, durée, destinataire, transfert hors UE) ;
   - tout ce que dit la politique existe réellement dans le code (une politique qui décrit un traitement inexistant est elle-même inexacte).
   - **Prestataires réels ↔ déclarés** : construis la liste des prestataires réels à partir de l'hébergeur détecté (`check_headers.py`), des MX et du service de redirection (`check_email.py`), du service d'envoi d'e-mails, de la boîte de réception (réponse de l'utilisateur), des API appelées dans le code (`fetch("https://api.…")`) et des polices ou scripts externes. Compare avec les destinataires de la politique de confidentialité et l'hébergeur des mentions légales, **dans les deux sens** (un ancien prestataire encore cité est aussi un écart), et mets le tableau « réel / déclaré / écart » dans les détails techniques.
4. **Accessibilité (RGAA)** : au-delà d'axe-core, vérifie à la lecture du code les critères qu'aucun outil automatique ne couvre : animations et contenus en mouvement (pause, `prefers-reduced-motion`), alternatives des contenus non textuels, ordre de lecture, messages d'erreur des formulaires, changements de contexte, textes en image.
5. Note dans la section technique repliée du rapport le nombre de fichiers et de textes relus et chaque constat avec `fichier:ligne` ; dans la partie principale, chaque constat devient une action en mots simples. Ne conclus pas sur un point légal tant que cette lecture n'est pas faite.

## Étape 3 — Tester le site en fonctionnement

Les tests en navigateur sont **obligatoires** pour les points 9, 10, 11, 27 et 28 : un bandeau peut exister dans le code et laisser passer Google Analytics.

**Pour une appli mobile**, le navigateur est remplacé par l'appli lancée sur un **simulateur iOS** (outil iOS Simulator de la session s'il existe, sinon Xcode / `xcrun simctl`) ou un **émulateur Android**, avec l'accord de l'utilisateur : suis `references/mobile.md` §6 (premier lancement sans consentement, demandes d'autorisation, paramètres, suppression du compte, VoiceOver ou TalkBack, grande police). Les points M2, M3, M4, M5 et M7 restent ❓ tant que l'appli n'a pas été lancée.

1. **Lancer le site** : commande de dev ou de preview du projet (ou URL de préproduction fournie). Si le site ne démarre pas, essaie de le faire démarrer (dépendances, variables d'environnement d'exemple) ; à défaut, marque les points concernés ❓ et dis pourquoi.
2. **Tester avec un navigateur**, par ordre de préférence :
   - **Playwright disponible** (ou installable avec l'accord de l'utilisateur) : `node <skill>/scripts/live_check.mjs <url> <url/page2> … --axe`. Il teste en session neuve les cookies (y compris HttpOnly) et les requêtes avant consentement, clique sur « Refuser », revérifie, teste la navigation au clavier, lance axe-core et prend des captures.
   - **Outil navigateur de la session** (navigateur intégré, Claude in Chrome, Playwright MCP, DevTools MCP) : ouvre le site dans une session sans cookies, exécute le contenu de `scripts/browser_probe.js` comme expression JavaScript sur chaque page clé, lis les cookies et les requêtes réseau, clique sur « Refuser », recommence ; teste la touche Tab sur la page d'accueil, le bandeau, un formulaire et le tunnel de commande.
   - **Aucun navigateur** : demande à l'utilisateur de coller `browser_probe.js` dans la console de son navigateur en navigation privée et de te renvoyer le résultat.
3. **Pages à tester au minimum** : accueil, une page de contenu, formulaire de contact ou d'inscription, fiche produit, panier et étape de paiement (sans payer), espace compte, pages légales.
   - `live_check.mjs` cherche Playwright et `@axe-core/playwright` **dans le dossier courant** : installe-les au même endroit (`npm i -D playwright @axe-core/playwright && npx playwright install chromium`) et lance le script depuis ce dossier.
   - S'il n'y a **ni cookie ni requête vers un traceur**, l'absence de bouton « Refuser » est normale : le script l'affiche « ➖ sans objet ».
   - Si une page renvoie une **protection anti-robots** (Vercel Security Checkpoint, Cloudflare…), le script l'affiche « ❓ page bloquée » au lieu de tester la page de contrôle : refais les tests sur la version de production lancée en local. `check_headers.py` fait de même pour les en-têtes.
   - Les éléments des outils de développement (barre Next.js, Vite, Astro…) sont ignorés au test clavier. Si le script signale un **serveur de développement**, refais les tests d'en-têtes et de scripts sur la version de production (`build` puis `start`/`preview`), car la politique de sécurité et les scripts y sont différents.
4. **Tester les en-têtes HTTP, l'hébergeur et la résistance aux robots** : `python3 <skill>/scripts/check_headers.py <url> --probe-files`, sur la version en ligne (ou de production). Il affiche :
   - l'**hébergeur détecté** et l'**adresse IP réellement contactée**, et compare avec l'hébergeur cité dans les mentions légales (trouvées dans les liens de l'accueil, ou `--mentions <url>`) ;
   - les redirections de **toutes les variantes** (`http://` et `https://`, avec et sans `www`) : chacune doit finir en `https://` sur l'adresse principale ;
   - la **liste des chemins testés** avec statut et durée : un fichier servi, une erreur 5xx, une réponse lente (> 3 s) ou pas de réponse sur une adresse inconnue sont des constats (un robot qui fouille peut faire planter le site et déclencher des alertes en masse).
   - **Après un changement d'hébergeur ou de DNS**, ajoute `--resolve-via 1.1.1.1` : le nom est résolu par un DNS public et cette adresse est forcée, pour ne pas tester l'ancien hébergeur resté dans le cache de l'ordinateur. Ne conclus pas avant d'avoir vu dans « Hébergeur détecté » le nouvel hébergeur.
5. **Tester l'e-mail** : `python3 <skill>/scripts/check_email.py <domaine> --textes textes-visibles.md` (MX de chaque adresse affichée, SPF, DKIM, DMARC, service de redirection). Puis **demande à l'utilisateur d'envoyer un vrai message** à l'adresse de contact et une demande par le formulaire, et de confirmer la réception (spams compris) : le point « l'adresse de contact reçoit bien » reste ❓ tant que ce n'est pas confirmé.
6. **Contrastes** à corriger : `python3 <skill>/scripts/contrast.py <texte> <fond>` donne le ratio et une couleur conforme proche.

## Étape 4 — Évaluer selon la grille

Lis `references/checklist.md` : **30 points légaux + 15 points sécurité + 7 points hébergement et e-mail (52 points)**. Évalue chaque point, en lisant les références utiles au projet :

| Fichier | Contenu |
|---|---|
| `references/checklist.md` | La grille complète, la méthode de test de chaque point |
| `references/france.md` | Mentions légales, statuts, langue, RGAA, EAA |
| `references/rgpd-cookies.md` | RGPD, politique de confidentialité, cookies CNIL, prospection, mineurs, transferts |
| `references/ecommerce.md` | Code de la consommation : commande, rétractation, garanties, médiateur, prix |
| `references/saas-plateformes.md` | CGU, abonnements, résiliation, DSA, AI Act |
| `references/pratiques-trompeuses.md` | Dark patterns, avis, allégations commerciales et environnementales |
| `references/licences.md` | Polices, images, icônes, code, contenus IA |
| `references/securite-owasp.md` | OWASP Top 10 2025 + 5 compléments, tests et corrections |
| `references/hebergeurs.md` | Hébergeurs et prestataires d'e-mail : offre gratuite et usage pro, contrat de données, pays, comment les reconnaître |
| `references/mobile.md` | Applis : règles Apple et Google Play vérifiées, SDK et consentement, permissions, sécurité, tests sur simulateur |
| `references/international.md` | UK, Suisse, USA, Québec, Brésil, etc. |
| `references/corrections.md` | Comment corriger chaque problème selon la stack |
| `references/veille.md` | Règles récentes ou instables à revérifier |

**Revérifier les points instables** : pour chaque ligne de `veille.md` qui concerne le projet et dont la vérification date de plus de 3 mois, fais une recherche rapide (Légifrance, EUR-Lex, cnil.fr, DGCCRF, owasp.org en priorité) et indique le résultat dans le rapport.

## Étape 5 — Rapport, puis STOP

**Avant d'écrire** : si un `CONFORMITE.md` existe déjà, demande à l'utilisateur si les actions « Vous » de l'audit précédent ont été faites (révocation de clé, DPA signé, Kbis…), pour ne pas laisser dans le rapport une étape déjà réglée.

Écris `CONFORMITE.md` à la racine du projet **en partant de `templates/rapport-conformite.md`** (même structure à chaque audit, pour pouvoir comparer). **Le rapport s'adresse au propriétaire du site, pas à un développeur** : n'importe qui doit voir tout de suite, pour chaque point, si c'est bon, moyen ou pas bon.

**Les 5 statuts** (les seuls utilisés dans tout le rapport) :

| Symbole | Veut dire |
|---|---|
| ✅ Bon | Vérifié, rien à faire |
| 🟠 Moyen | Ça marche, mais peut être amélioré, ou petit risque |
| ❌ Pas bon | À corriger : risque d'amende, de faille ou de perte de clients |
| ❓ À vérifier | Le test n'a pas pu être fait : dire pourquoi et quoi faire |
| ➖ Pas concerné | Ne s'applique pas à ce site : dire pourquoi en quelques mots |

**Les 9 catégories, dans cet ordre** (plus 📱 Appli mobile et stores, avant 🖥️ Hébergement, pour une appli) (correspondance avec la grille : `checklist.md`, tableau « Catégories du rapport ») : 🏢 Qui est derrière le site · 👤 Données des visiteurs · 🍪 Cookies et pistage · 📝 Textes et promesses · 🛒 Vente et contrats · ♿ Accessibilité · 🔒 Sécurité du site · 🖥️ Hébergement et prestataires · ✉️ E-mail.

**Structure** (voir le modèle) : titre et date → **En bref** (verdict 🟢/🟠/🔴 en une phrase, totaux par statut, tableau par catégorie avec une note sur 10, note globale, légende) → **À faire** (tableau numéroté : statut, action, pourquoi, qui, temps) et **À respecter au quotidien** → **Le détail, point par point** (une section par catégorie) → **Ce qui a été corrigé** → avertissement de responsabilité → **Détails techniques** repliés, avec le **tableau des 15 points de sécurité** (S1 à S15 : contrôle en clair, référence OWASP, statut, comment c'est vérifié, constat), rempli à partir de `references/securite-owasp.md`.

Règles d'écriture :
- **Une ligne par point de la grille, toujours, même quand il est ✅ ou ➖**, dans sa catégorie : symbole → **titre court en gras** → ce qu'on a constaté en une phrase → « → ce qu'il faut faire (action N) » si ce n'est ni ✅ ni ➖. Le lecteur doit pouvoir parcourir les 52 lignes (59 pour une appli) et voir que rien n'a été oublié. Plusieurs constats sur un même point tiennent sur sa ligne (le statut le plus grave l'emporte).
- **Chaque point apparaît une seule fois.** Les totaux de « En bref » sont **calculés à partir des lignes** du détail.
- **« À faire »** : une ligne par action, numérotée de 1 à N sans trou, du plus grave au moins grave (failles exploitables et secrets exposés, puis pistage sans accord, puis informations légales manquantes, puis pratiques trompeuses, puis accessibilité bloquante, puis le reste). Un point 🟠, ❌ ou ❓ renvoie à son action. Les **démarches hors grille** (Kbis, boîte e-mail pro, test au lecteur d'écran, révocation d'une clé collée dans la conversation) ont le symbole 🗂️ et ne comptent pas dans les totaux.
- **Un point ❓ n'est jamais présenté comme bon** : il a son action « Vérifier… » avec « Vous » ou « Claude ».
- **Interdit dans la partie principale** : sigles non expliqués (OWASP, CSP, HSTS, XSS, SSRF, DPA, LCEN, RGAA, WCAG…), numéros de points, chemins de fichiers, articles de loi. Dis ce que ça protège (« protection contre l'ajout de code malveillant dans les pages » plutôt que « CSP »). Si un mot technique est inévitable, explique-le entre parenthèses la première fois (« contrat de protection des données (DPA) »). Tout le technique va dans le bloc replié, avec la correspondance catégorie → points → références.
- **Notes sur 10** : pour chaque catégorie, moyenne des points évalués (✅ = 10, 🟠 = 7, ❌ = 0 ; ➖ et ❓ ne comptent pas), arrondie au demi-point ; un ❌ limite la note de sa catégorie à 5. Catégorie entièrement ➖ : « — ». Note globale = même calcul sur tous les points évalués. Dis que les notes ne jugent ni le design ni les textes de vente.
- **Verdict** : 🔴 s'il y a un ❌ urgent (voir ci-dessous) ; 🟠 s'il reste un ❌ ou un ❓ important ; 🟢 sinon.

Classe toujours ❌ et en tête de « À faire » : traceurs chargés avant consentement, absence de bouton « Refuser » équivalent, mentions légales ou politique de confidentialité absentes, absence d'information sur la rétractation ou de fonction de rétractation pour un site marchand, absence de médiateur, case de consentement pré-cochée, secret exposé, contrôle d'accès absent sur des données personnelles, injection exploitable, offre d'hébergement qui interdit l'usage commercial, adresse de contact affichée qui ne reçoit pas.

**Vérification obligatoire avant de présenter le rapport** :

```bash
python3 <skill>/scripts/check_report.py CONFORMITE.md
```

Il vérifie que chaque ligne du détail a un statut, que le total fait 52 (59 pour une appli), que les totaux et le tableau « En bref » correspondent exactement aux lignes, que « À faire » est numéroté sans trou, que les actions citées existent, et repère le jargon. Corrige jusqu'à ce qu'il n'y ait plus de ❌, et traite ses remarques 🟠 (jargon à expliquer ou à déplacer).

Écris aussi `.claude/.last-audit` (texte simple : date, version du skill, commit git `git rev-parse HEAD`, URL testées) : il sert au mode retest rapide.

Présente ensuite à l'utilisateur un résumé court (verdict, actions ❌ et ❓) et **arrête-toi** : demande ce qu'il valide (tout, une sélection de numéros d'actions, ou rien) et les informations d'identité manquantes. Ne modifie rien avant sa réponse.

## Étape 6 — Corriger (après validation)

Applique les corrections validées en suivant `references/corrections.md`, dans l'ordre de gravité, par petits lots cohérents :
- utilise la stack et les conventions du projet (composants, styles, i18n, routes) ; pars des modèles de `templates/` en supprimant tout ce qui ne s'applique pas — une politique de confidentialité qui décrit des traitements inexistants est elle-même non conforme ;
- après chaque lot : build, lint et tests du projet s'ils existent ; corrige ce que tu as cassé avant de continuer ;
- **corrections à risque** (montée de version majeure, changement d'authentification, migration de données, suppression de fonctionnalité, choix d'un prestataire payant) : propose-les, ne les applique qu'avec un accord explicite pour chacune ;
- **actions que toi seul ne peux pas faire** (révoquer une clé chez un fournisseur, adhérer à un médiateur, signer un DPA, acheter une licence) : liste-les clairement pour l'utilisateur.

| Modèle | Usage |
|---|---|
| `templates/mentions-legales.md` | Tous les sites |
| `templates/politique-confidentialite.md` | Données personnelles |
| `templates/politique-cookies.md` | Traceurs |
| `templates/bandeau-cookies.md` | Spécification du bandeau et du blocage préalable |
| `templates/cgv.md` | Vente |
| `templates/politique-retours.md` | Rétractation, retours, remboursements |
| `templates/cgu.md` | Comptes, contenus d'utilisateurs, SaaS |
| `templates/declaration-accessibilite.md` | RGAA ou EAA |

## Étape 7 — Retester et clôturer

Relance **les mêmes tests** qu'aux étapes 2, 2 bis et 3 (scripts, relecture des textes modifiés, navigateur, en-têtes, e-mail). Une correction n'est faite que si le retest le confirme. Puis mets à jour `CONFORMITE.md` en gardant la même structure :
- passe la ligne du point corrigé à ✅ (ou ➖) dans « Le détail », retire l'action de « À faire » en renumérotant sans trou, et ajoute une ligne datée dans « Ce qui a été corrigé » ;
- recalcule les totaux, le tableau, les notes et le verdict de « En bref », puis relance `check_report.py` ;
- mets la preuve du retest dans la section technique repliée (par exemple « 0 requête vers google-analytics.com avant consentement ») ;
- vérifie qu'il ne reste aucun marqueur `[À COMPLÉTER]` affiché aux visiteurs (`grep -rn "À COMPLÉTER"`) ; s'il en reste, ajoute une action « Vous » pour fournir l'information ;
- mets à jour `.claude/.last-audit`.

Termine par un message court : ce qui a été corrigé et vérifié, ce qui reste à fournir ou à faire, et si le site peut être mis en ligne.

## Mode retest rapide

Quand un audit complet a déjà été fait et que l'utilisateur demande de revérifier (le jour même, après une correction côté hébergeur, etc.) :

1. Lis `.claude/.last-audit` (date, version, commit, URL testées). S'il n'existe pas, ou si la version du skill a changé, fais un audit complet.
2. `git log --oneline <commit>..HEAD` et `git diff --name-only <commit>` (plus `git status` pour les fichiers non commités) :
   - **aucun fichier du site modifié** (pages, composants, contenus, traductions, configuration) → **mode retest** : relance les deux analyses statiques et `extract_texts.py` seulement pour comparer les nombres, sans relecture intégrale ;
   - **des fichiers modifiés** → relis **seulement ces fichiers** (et leurs textes) en plus des scripts.
3. Refais **toujours** les tests en ligne et en navigateur : hébergement, DNS, en-têtes, fichiers sensibles, e-mail, cookies. Ils changent sans que le code change (réglage de l'hébergeur, DNS, prestataire d'e-mail).
4. Dans le rapport, écris dans les détails techniques « Retest rapide du [date] : code inchangé depuis [commit] » (ou la liste des fichiers relus).

## Analyser le site d'un tiers (prospect, client, concurrent)

Quand l'utilisateur donne seulement un lien vers un site qui n'est pas le sien :

1. **Tests passifs seulement** : ce qu'un visiteur normal reçoit. Pas de `--probe-files` (fichiers sensibles, adresses au hasard), aucune tentative d'injection, de connexion ou d'envoi de formulaire, **sauf accord écrit du propriétaire** (le demander à l'utilisateur ; sans réponse, c'est non).
2. **Copie publique** : `python3 <skill>/scripts/fetch_public.py <url> --out site-public` (accueil, pages légales, contact, panier, compte et scripts du site ; robots.txt respecté), puis `scan_trackers.py site-public` et `audit_static.py site-public`. Les règles « côté serveur » sont coupées sur cette copie.
3. **En ligne** : `check_headers.py <url>` (sans `--probe-files`), `check_email.py <domaine>`, et le navigateur de l'étape 3 (cookies et requêtes avant consentement, bouton « Refuser », clavier, contrastes) : ce sont les tests les plus solides sans le code.
4. **Ce qui reste ❓** sans le code : contrôle d'accès (S1), conception (S6), journaux (S9), limitation anti-abus (S13), API (S14), registre des traitements, contrats de données (DPA), durées de conservation réelles. Ne jamais les marquer ✅ : écrire « invisible de l'extérieur ».
5. **Rapport** : préciser en haut « Analyse externe du [date et heure], sans accès au code ni au serveur », dire pour chaque constat s'il a été **vu** (preuve : capture, en-tête, requête) ou seulement **supposé**, et mettre le niveau de confiance. Un site change : un constat daté peut être faux le lendemain.
6. **Usage commercial** (prospection, devis) : rester factuel et courtois, ne pas publier ni diffuser le rapport sans l'accord du propriétaire du site, ne pas affirmer une infraction (« ce point semble ne pas respecter… »), et rappeler que ce n'est pas un avis juridique.

## Mode audit seul

Si l'utilisateur demande seulement un audit (« audite », « vérifie », « dis-moi ce qui manque »), fais les étapes 1 à 5 et arrête-toi. S'il fournit sa propre liste de points, utilise-la comme structure du rapport et complète avec les points de la grille qu'elle omet, dans une section « Autres points détectés ».
