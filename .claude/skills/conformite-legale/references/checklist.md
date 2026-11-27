# Grille d'audit : 30 points légaux + 15 points sécurité + 7 points hébergement et e-mail (52 points)

Grille de référence du skill. Chaque point indique **quoi vérifier**, **comment le tester** et **où trouver la correction**. Elle applique le droit français et européen (RGPD, CNIL, Code de la consommation, RGAA/EAA, DSA, AI Act) ; les règles d'autres pays s'ajoutent seulement si le projet les vise (`international.md`).

Méthodes de test :
- **[S]** analyse statique du code (`scripts/scan_trackers.py`, `scripts/audit_static.py`)
- **[N]** test dans un navigateur sur le site lancé (`scripts/browser_probe.js` ou `scripts/live_check.mjs`)
- **[H]** test HTTP du site en ligne ou local (`scripts/check_headers.py`)
- **[M]** vérification manuelle (lecture du code, du parcours, des textes)
- **[Q]** question à l'utilisateur (information hors code)

Statuts : ✅ OK · ⚠️ À améliorer · ❌ Manquant / non conforme · ➖ Non applicable · ❓ Non vérifiable (dire pourquoi)

---

## A. Pages et informations légales

**1. Mentions légales** — éditeur selon son statut, directeur de publication, hébergeur (nom, adresse, téléphone : **exact**, voir H3), contact joignable (voir E1). [S][N][M] · `france.md` §1-3 · modèle `templates/mentions-legales.md`

**2. Politique de confidentialité** — existe, exacte (correspond aux traitements et outils réellement présents), complète (art. 13 RGPD). [S][M] · `rgpd-cookies.md` §2 · `templates/politique-confidentialite.md`

**3. Politique cookies** — liste réelle des traceurs, finalités, durées, moyen de retirer son choix. [S][N] · `templates/politique-cookies.md`

**4. CGU** — si comptes, contenus d'utilisateurs ou service en ligne ; acceptation explicite et versionnée. [S][M] · `saas-plateformes.md` §1 · `templates/cgu.md`

**5. CGV** — si vente ; informations précontractuelles complètes, en français. [S][M] · `ecommerce.md` §1 · `templates/cgv.md`

**6. Rétractation et remboursement** — délai de 14 jours, exceptions, formulaire type, **fonction de rétractation en ligne** (depuis le 19/06/2026), politique de retours et de remboursement claire. [S][N][M] · `ecommerce.md` §3 · `templates/politique-retours.md`

**7. Garanties légales et médiateur** — encadré officiel de garantie de conformité, vices cachés, coordonnées du médiateur de la consommation ; **pas** de lien vers l'ancienne plateforme RLL/ODR. [S][Q] · `ecommerce.md` §4, §5, §10

**8. Accès et langue** — liens légaux accessibles depuis toutes les pages (pied de page), textes destinés aux consommateurs en français. [N][M] · `france.md` §4

## B. Cookies et traceurs

**9. Bandeau conforme** — « Tout refuser » aussi visible et accessible que « Tout accepter » (même niveau, même taille, même style) ; « Personnaliser » par finalité ; croix = refus ; pas de consentement par défilement ; bandeau utilisable au clavier. [N][M] · `rgpd-cookies.md` §5 · `templates/bandeau-cookies.md`

**10. Aucun traceur avant consentement** — au premier chargement, puis après un refus : aucun cookie non exempté, aucune requête vers un domaine publicitaire ou analytique non exempté. **Test obligatoire en navigateur.** [N][S]

**11. Retrait et durée du choix** — lien « Gérer mes cookies » sur toutes les pages ; le retrait coupe réellement les scripts ; choix conservé environ 6 mois ; refus respecté (pas redemandé à chaque page). [N]

**12. Services tiers intégrés** — polices hébergées localement, vidéos, cartes et réseaux sociaux en chargement au clic, chat et captcha évalués, liste complète des tiers. [S][N] · `rgpd-cookies.md` §6

## C. Données personnelles (RGPD)

**13. Formulaires** — mention d'information près de l'envoi, lien vers la politique, consentement distinct et **non pré-coché** quand il est requis (newsletter, partenaires), pas de consentement couplé aux CGV. [S][N]

**14. Minimisation** — seuls les champs nécessaires ; champs facultatifs signalés ; pas de données sensibles sans nécessité. [S][M]

**15. Droits et suppression** — moyen simple d'exercer ses droits ; **suppression du compte et des données** accessible ; export des données pour un compte. [S][N][M]

**16. Durées de conservation** — définies, cohérentes avec la politique, et appliquées (purge ou anonymisation automatique, ou procédure). [M][Q]

**17. Sous-traitants, transferts, registre** — liste des prestataires **comparée aux prestataires réels** (hébergeur détecté, MX et service de redirection, service d'envoi, boîte de réception, API appelées), contrats de sous-traitance (DPA), transferts hors UE encadrés, registre des traitements, procédure de violation de données sous 72 h. [S][Q] · `rgpd-cookies.md` §3, §9

**18. Mineurs** — si le public peut être mineur : âge minimum, consentement parental en dessous de 15 ans, pas de profilage publicitaire. [M][Q] · `rgpd-cookies.md` §8

## D. Vente, prix et abonnements

**19. Prix et commande** — prix TTC, frais annoncés avant paiement, **total affiché avant paiement**, récapitulatif modifiable, bouton « Commander avec obligation de paiement » (ou équivalent sans ambiguïté), confirmation par e-mail ; prix barrés calculés sur le prix le plus bas des 30 derniers jours. [S][N] · `ecommerce.md` §2, §6

**20. Abonnements** — résiliation en ligne en 3 clics (« Résilier votre contrat »), information sur la reconduction, essai gratuit transparent. [S][N] · `saas-plateformes.md` §2

## E. Pratiques commerciales

**21. Pas de dark patterns** — fausse urgence (minuteur qui se réinitialise), fausse rareté, cases pré-cochées, culpabilisation (« Non merci, je n'aime pas économiser »), désabonnement caché, options payantes ajoutées par défaut. [S][N][M] · `pratiques-trompeuses.md` §1

**22. Avis clients** — information sur l'existence et la méthode de contrôle des avis, date, pas de faux avis ni d'avis sélectionnés trompeusement. [S][M] · `pratiques-trompeuses.md` §2

**23. Allégations** — pas de « n°1 », « meilleur », « garanti », chiffres ou résultats sans preuve ; allégations environnementales précises et prouvées (« neutre en carbone » interdit sans conditions strictes). [S][M] · `pratiques-trompeuses.md` §3

**24. Licences et propriété intellectuelle** — droit d'utiliser chaque police, image, icône, vidéo, musique, bibliothèque de code et contenu généré par IA ; crédits exigés par les licences ; marques de tiers. [S][M][Q] · `licences.md`

**25. E-mails marketing** — consentement préalable (B2C), **lien de désinscription dans chaque e-mail marketing**, identité de l'expéditeur. [S][M] · `rgpd-cookies.md` §7

## F. Accessibilité (RGAA / EAA / WCAG 2.1 AA)

**26. Images et médias** — texte alternatif pertinent sur chaque image porteuse d'information, `alt=""` sur les images décoratives, sous-titres et transcriptions pour les vidéos, pas de lecture automatique avec son. [S][N]

**27. Contrastes et lisibilité** — 4,5:1 pour le texte normal, 3:1 pour le grand texte et les composants d'interface ; lisible à 200 % de zoom et à 320 px de large ; l'information ne passe pas uniquement par la couleur. [N][S] · `scripts/contrast.py`

**28. Clavier et focus** — tout est utilisable au clavier (menus, modales, bandeau cookies, formulaires, tunnel de commande), focus visible, ordre logique, pas de piège au clavier, lien d'évitement. [N][M]

**29. Structure et formulaires** — `lang` de la page, titres hiérarchisés, repères (`header`, `nav`, `main`, `footer`), champs étiquetés, erreurs explicites et liées au champ, boutons et liens avec un nom accessible. [S][N]

**30. Déclaration et obligations** — déclaration d'accessibilité si le site est soumis au RGAA ou à l'EAA, mention de conformité en page d'accueil (RGAA), moyen de contact. [S][Q] · `france.md` §5-6 · `templates/declaration-accessibilite.md`

## G. Sécurité (OWASP Top 10 2025 + 5 compléments)

Le RGPD (art. 32) impose une sécurité adaptée au risque : une faille qui expose des données personnelles est aussi un manquement légal. Détails, tests et corrections : `securite-owasp.md`.

**S1. A01 Contrôle d'accès défaillant** (dont SSRF, accès à la ressource d'un autre utilisateur, routes d'admin non protégées)
**S2. A02 Mauvaise configuration de sécurité** (mode debug, pages d'erreur bavardes, CORS ouvert, fichiers exposés comme `.env` ou `.git`)
**S3. A03 Chaîne d'approvisionnement logicielle** (dépendances vulnérables ou abandonnées, lockfile, scripts tiers sans SRI)
**S4. A04 Défaillances cryptographiques** (HTTPS, HSTS, mots de passe hachés avec argon2 ou bcrypt, données sensibles chiffrées)
**S5. A05 Injections** (SQL, NoSQL, commandes, XSS, templates)
**S6. A06 Conception non sécurisée** (logique métier : prix modifiable côté client, coupons réutilisables, absence de limites)
**S7. A07 Défaillances d'authentification** (force brute, sessions, réinitialisation de mot de passe, 2FA pour l'admin)
**S8. A08 Intégrité des logiciels et des données** (désérialisation, webhooks non signés, mises à jour non vérifiées)
**S9. A09 Journalisation et alertes** (événements de sécurité journalisés sans données sensibles, alertes qui ignorent les 404 et ne peuvent pas s'emballer, conservation limitée)
**S10. A10 Mauvaise gestion des conditions exceptionnelles** (erreurs non gérées, « fail-open », traces de pile exposées ; une adresse inconnue — `/.git/config`, `/<aléa>.php` — doit répondre 404 vite, sans erreur 5xx : `check_headers.py --probe-files`)
**S11. En-têtes HTTP et cookies** (CSP, HSTS, X-Content-Type-Options, frame-ancestors, Referrer-Policy, Permissions-Policy ; cookies `Secure`, `HttpOnly`, `SameSite`)
**S12. Secrets** (aucune clé d'API, mot de passe ou jeton dans le code, le dépôt Git ou le bundle client)
**S13. Abus et limitation** (rate limiting sur la connexion, l'inscription, les formulaires, l'API ; anti-spam respectueux de la vie privée ; sur un hébergement serverless/edge, compteur **partagé** et pas en mémoire)
**S14. API** (OWASP API Top 10 : autorisation au niveau de chaque objet, exposition excessive de données, validation des entrées)
**S15. Fonctionnalités IA** (OWASP LLM Top 10 : injection de prompt, fuite de données dans les prompts, sorties non filtrées, clés d'API côté client, coût non plafonné)

## H. Hébergement et prestataires

**H1. Offre autorisée pour un pro** — l'offre d'hébergement utilisée (gratuite ou payante) autorise un usage commercial pour ce site. Détection de l'hébergeur [S][H], offre demandée [Q]. ❌ si l'offre l'interdit (ex. Vercel Hobby, GitHub Pages pour une boutique). · `hebergeurs.md`

**H2. Contrats de protection des données** — un contrat de traitement des données (DPA, art. 28 RGPD) couvre l'offre utilisée chez l'hébergeur et chez chaque prestataire qui reçoit des données (envoi d'e-mails, boîte de réception, formulaires, outils). [Q][M] · `hebergeurs.md`, `rgpd-cookies.md` §3

**H3. Hébergeur annoncé = hébergeur réel** — le nom et l'adresse de l'hébergeur des mentions légales (et de la politique de confidentialité) correspondent à l'hébergeur qui sert réellement le site (`check_headers.py` : « Hébergeur détecté », IP contactée). ❌ si différent. [H][M]

## I. E-mail

**E1. L'adresse de contact reçoit bien** — chaque adresse affichée sur le site a des serveurs de réception (MX) ; un vrai message envoyé par l'utilisateur a été reçu, spams compris. **❓ tant qu'un vrai envoi n'a pas été confirmé.** Un service de redirection (Cloudflare, registrar, ImprovMX) est un sous-traitant à lister. [H][Q] · `scripts/check_email.py`

**E2. E-mails signés au nom du domaine** — SPF (un seul enregistrement, pas de `+all`), DKIM du service d'envoi, DMARC présent. [H] · `scripts/check_email.py`, `corrections.md` §9

**E3. Pas de spams** — les e-mails du site (devis, confirmations) arrivent en boîte de réception ; sinon le délai de réponse promis sur le site n'est plus tenable. [Q] · `corrections.md` §9

**E4. Les e-mails du site partent vraiment** — le formulaire vérifie la réponse du service d'envoi avant d'afficher « envoyé » (`res.ok`, `error`) ; l'adresse de destination n'est pas dans la liste de blocage du prestataire (Resend « Suppressions », Brevo, Postmark, SendGrid) ; quota gratuit suffisant ; les alertes automatiques ne peuvent pas s'emballer (S9). [S][Q] · `securite-owasp.md` S9

## J. Appli mobile et stores (seulement pour une appli)

Pour une appli iOS ou Android, ces 7 points s'ajoutent (grille de 59 points). `scripts/audit_mobile.py` + tests sur simulateur ; détails dans `mobile.md`.

**M1. Fiches des stores et déclarations** — « App Privacy » (Apple) et « Sécurité des données » (Google) exactes, SDK compris ; manifeste de confidentialité Apple (`PrivacyInfo.xcprivacy`) ; niveau d'API Android à jour (36 pour les mises à jour depuis le 31/08/2026) ; statut de trader déclaré. [S][Q]

**M2. Consentement avant les SDK de suivi** — aucun SDK de mesure, de publicité ou d'attribution actif avant l'accord (Firebase Analytics désactivé par défaut) ; App Tracking Transparency sur iOS avant le suivi entre applis ; « Refuser » aussi simple qu'« Accepter ». **Test sur l'appli lancée.** [S][N]

**M3. Permissions justifiées** — seulement les permissions utiles, demandées au bon moment, avec un texte précis et en français ; écran d'information avant la localisation en arrière-plan ; déclaration spéciale Google Play pour les permissions très sensibles. [S][N]

**M4. Compte : suppression et connexion** — suppression du compte dans l'appli (et par un lien web pour Google Play) ; si connexion Google ou Facebook, une option équivalente respectueuse de la vie privée sur iOS. [S][N]

**M5. Pages légales dans l'appli** — politique de confidentialité, conditions, mentions légales accessibles depuis l'appli (Paramètres, À propos) et sur la fiche du store. [S][N]

**M6. Sécurité de l'appli** — aucun secret dans l'appli (`.env` embarqué, variables publiques), jetons dans le trousseau sécurisé, trafic chiffré, pas de mode débogage, WebView limitées. [S]

**M7. Accessibilité mobile** — taille du texte du système respectée, boutons et images nommés pour VoiceOver et TalkBack, zones tactiles assez grandes. [S][N]

---

## Catégories du rapport

Le rapport range les 52 points en 9 catégories (59 points et 10 catégories pour une appli mobile), dans cet ordre (`templates/rapport-conformite.md`) :

| Catégorie | Points, dans l'ordre des lignes du rapport |
|---|---|
| 🏢 Qui est derrière le site | 1, 8 |
| 👤 Données des visiteurs | 2, 13, 14, 15, 16, 17, 18 |
| 🍪 Cookies et pistage | 10, 9, 11, 3, 12 |
| 📝 Textes et promesses | 21, 23, 24, 22, 25 |
| 🛒 Vente et contrats | 5, 4, 6, 7, 19, 20 |
| ♿ Accessibilité | 26, 27, 28, 29, 30 |
| 🔒 Sécurité du site | S4 connexion chiffrée, S11 protections envoyées au navigateur, S14 échanges pages/serveur, S2 fichiers secrets bien cachés, S10 résiste aux robots qui fouillent, S12 aucune clé dans le code, S3 outils à jour, S5 données piégées, S1 chacun ne voit que ce qui le concerne, S6 faille de logique, S13 envois en masse, S9 alertes, S7 comptes et mots de passe, S8 échanges avec d'autres services, S15 IA |
| 🖥️ Hébergement et prestataires | H1, H2, H3 |
| ✉️ E-mail | E1, E2, E3, E4 |
| 📱 Appli mobile et stores (si appli) | M1, M2, M3, M4, M5, M6, M7 |

---

## Points additionnels selon le projet

- **Appli mobile** : section J ci-dessus et `mobile.md` (stores, SDK, permissions, suppression de compte, tests sur simulateur).
- **Marchés hors UE** : `international.md`.
- **IA et contenus d'utilisateurs** : `saas-plateformes.md` §5-6 (DSA : signalement, modération, point de contact ; AI Act : mention « assistant IA »).
- **Activité réglementée** : `france.md` §3.
