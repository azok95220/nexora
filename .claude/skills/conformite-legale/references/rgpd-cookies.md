# RGPD, cookies et prospection

## Sommaire
1. Quand le RGPD s'applique
2. Politique de confidentialité (art. 13 et 14)
3. Obligations hors site (registre, sous-traitants, sécurité, violations)
4. Formulaires
5. Cookies et traceurs (CNIL)
6. Traceurs courants : consentement requis ou non
7. Prospection commerciale (e-mail, SMS, téléphone)
8. Mineurs
9. Transferts hors UE
10. Sanctions

---

## 1. Quand le RGPD s'applique

Règlement (UE) 2016/679 + loi Informatique et Libertés n° 78-17.
Dès qu'un site traite une donnée personnelle : formulaire de contact, compte, newsletter, commande, statistiques, adresse IP dans les journaux du serveur, cookies. En pratique, **tous les sites** sont concernés.

Il s'applique aussi à un éditeur hors UE qui vise des personnes dans l'UE (offre de biens ou services, suivi du comportement), qui doit alors désigner un **représentant dans l'UE** (art. 27).

---

## 2. Politique de confidentialité

Information « concise, transparente, compréhensible et aisément accessible », en langage clair. Contenu obligatoire :

- Identité et coordonnées du **responsable de traitement**
- Coordonnées du **DPO**, s'il y en a un
- Pour chaque traitement : **finalité** et **base légale** (consentement, contrat, obligation légale, intérêt légitime — et lequel)
- **Destinataires** ou catégories de destinataires (sous-traitants : hébergeur, outil d'e-mailing, prestataire de paiement, CRM…)
- **Transferts hors UE** et garanties (décision d'adéquation, clauses contractuelles types)
- **Durées de conservation** (ou critères pour les fixer)
- **Droits** : accès, rectification, effacement, limitation, portabilité, opposition, retrait du consentement à tout moment, et en France **directives sur le sort des données après le décès** (art. 85 de la loi I&L)
- Droit d'introduire une réclamation auprès de la **CNIL**
- Caractère obligatoire ou facultatif des données et conséquences d'un refus
- Existence d'une **décision automatisée** ou d'un profilage, le cas échéant
- Source des données si elles ne sont pas collectées directement auprès de la personne (art. 14)

Durées de conservation courantes (référentiels CNIL, à adapter) :
| Données | Durée habituelle |
|---|---|
| Prospect (contact sans achat) | 3 ans après le dernier contact |
| Client | Durée de la relation contractuelle + 3 ans pour la prospection |
| Pièces comptables / factures | 10 ans (Code de commerce) |
| Formulaire de contact | Le temps de traiter la demande, puis archivage limité |
| Journaux de connexion | 6 mois à 1 an |
| Cookies : choix de consentement | 6 mois recommandés |
| Compte inactif | Supprimer ou anonymiser après une période d'inactivité définie (souvent 2 à 3 ans) |

---

## 3. Obligations hors site

À signaler dans la section « Hors code » du rapport :
- **Registre des traitements** (art. 30) : la CNIL fournit un modèle. L'exemption pour les structures de moins de 250 salariés est très étroite ; recommande-le toujours.
- **Contrats avec les sous-traitants** (art. 28) : hébergeur, outils SaaS. La plupart proposent un DPA (Data Processing Agreement) à accepter. **Attention aux offres gratuites** : le DPA peut ne couvrir que les offres payantes (Vercel), et une boîte Gmail gratuite n'en a pas (voir `hebergeurs.md`).
- **Liste des destinataires = prestataires réels** : hébergeur réellement utilisé, service de redirection des e-mails (MX), service d'envoi, boîte de réception, API appelées. Un prestataire oublié ou un ancien prestataire encore cité rend la politique inexacte.
- **Sécurité** (art. 32) : HTTPS partout, mots de passe hachés (bcrypt, argon2), politique de mot de passe conforme à la recommandation CNIL, sauvegardes, contrôle d'accès, mises à jour.
- **Violation de données** (art. 33 et 34) : notification à la CNIL sous **72 heures**, information des personnes si risque élevé ; tenir un registre des violations.
- **Analyse d'impact (AIPD)** (art. 35) : données sensibles à grande échelle, surveillance systématique, profilage, données de personnes vulnérables, etc.
- **DPO** (art. 37) : obligatoire pour les organismes publics et les activités de suivi régulier à grande échelle ou de traitement à grande échelle de données sensibles.
- **Procédure d'exercice des droits** : répondre sous **1 mois**.
- **Données de santé** : hébergement chez un hébergeur certifié **HDS** en France.

---

## 4. Formulaires

- **Minimisation** : ne demande que ce qui est nécessaire (pas de date de naissance pour un formulaire de contact).
- **Mention d'information** près du bouton d'envoi :
  > Les informations recueillies sont utilisées par [éditeur] pour [finalité]. Elles sont conservées [durée]. Vous pouvez exercer vos droits d'accès, de rectification et de suppression en écrivant à [contact]. En savoir plus : [lien vers la politique de confidentialité].
- **Consentement** (newsletter, partenaires) : case **non pré-cochée**, distincte de l'acceptation des CGV, finalité précise.
- Ne pas conditionner la commande à l'acceptation de la newsletter.
- Champs obligatoires clairement signalés.

---

## 5. Cookies et traceurs

**Base** : article 82 de la loi Informatique et Libertés (transposition de la directive ePrivacy), lignes directrices et recommandation de la CNIL (2020, avec la FAQ de la CNIL ; recommandation spécifique aux pixels des e-mails d'avril 2026).
Concerne tous les traceurs : cookies, localStorage, pixels, fingerprinting, SDK dans les applis mobiles.

### Règles du bandeau
- **Aucun traceur soumis au consentement avant le choix de l'utilisateur.** Ni au premier chargement ni après avoir fermé le bandeau.
- **Refuser doit être aussi simple qu'accepter** : bouton « Tout refuser » (ou « Continuer sans accepter » clairement visible) au même niveau et avec la même mise en valeur que « Tout accepter ». C'est le grief n° 1 des sanctions CNIL.
- **Choix par finalité** (mesure d'audience, publicité, réseaux sociaux…) accessible depuis le bandeau (« Personnaliser »).
- **Information** : finalités, liste des tiers (accessible), conséquences du choix, durée.
- **Pas de consentement implicite** : poursuivre la navigation ou faire défiler la page ne vaut pas accord.
- **Retrait à tout moment, aussi facilement** : lien permanent « Gérer mes cookies » (pied de page ou icône flottante) qui rouvre le panneau.
- **Durée du choix** : conserver le choix (accord comme refus) environ **6 mois**, puis redemander. Ne pas redemander à chaque visite après un refus.
- **Durée de vie des cookies** soumis au consentement : 13 mois maximum ; données de mesure d'audience conservées 25 mois maximum.
- **Preuve du consentement** : pouvoir démontrer qu'il a été recueilli (horodatage, version du bandeau).
- **Cookie wall** (accès conditionné à l'acceptation) : apprécié au cas par cas, risqué ; à éviter, sauf alternative réelle et équitable (par exemple un accès payant raisonnable), à faire valider.
- **Dark patterns** à proscrire : bouton de refus en lien gris, croix qui vaut acceptation, cases pré-cochées, formulations culpabilisantes.

### Traceurs exemptés de consentement
Ils doivent tout de même être mentionnés dans la politique cookies :
- panier d'achat, session et authentification
- sécurité (anti-fraude, prévention des abus, équilibrage de charge)
- mémorisation du choix de consentement
- personnalisation de l'interface demandée par l'utilisateur (langue, thème)
- **mesure d'audience** répondant aux conditions de la CNIL : finalité strictement limitée à la mesure de l'audience du site pour le compte exclusif de l'éditeur, données agrégées, pas de recoupement avec d'autres traitements, pas de transmission à des tiers, adresse IP tronquée ou non conservée, durée limitée, et droit d'opposition proposé. La CNIL publie la liste des outils pouvant être configurés de cette façon (Matomo, Plausible, AT Internet / Piano, etc.). **Google Analytics dans sa configuration standard n'est pas exempté.**

---

## 6. Traceurs courants

| Service | Consentement ? | Remarque |
|---|---|---|
| Google Analytics (GA4), Google Tag Manager avec balises marketing | Oui | GTM seul ne dépose pas de cookie, mais il charge ce qui en dépose |
| Meta Pixel, TikTok Pixel, LinkedIn Insight, Pinterest, Snap, X | Oui | |
| Google Ads, DoubleClick, Criteo, Taboola, Outbrain | Oui | |
| Hotjar, Microsoft Clarity, FullStory, Mouseflow (replay, heatmaps) | Oui | |
| Intercom, Crisp, HubSpot chat, Zendesk widget | Oui en général | Sauf configuration strictement nécessaire au service demandé |
| YouTube, Vimeo, Google Maps, Twitter/X, Instagram, Facebook intégrés | Oui | Utiliser youtube-nocookie ne suffit pas toujours ; préférer le chargement au clic |
| Google Fonts chargées depuis fonts.googleapis.com | Pas un cookie, mais transfert d'IP vers Google | Héberger les polices localement |
| Google reCAPTCHA | Débattu | Préférer une alternative respectueuse de la vie privée ou informer clairement ; hCaptcha, Friendly Captcha, Cloudflare Turnstile |
| Stripe, PayPal (dans le tunnel de paiement) | Non pour la fonction de paiement | Les cookies anti-fraude sont considérés nécessaires |
| Matomo, Plausible, Fathom, Simple Analytics | Peut être exempté | Si configuré selon les conditions CNIL ; sinon consentement |
| Vercel Analytics, Cloudflare Web Analytics | Souvent sans cookie | Vérifier la configuration et les transferts hors UE |
| Sentry, LogRocket | Sentry : intérêt légitime possible (erreurs) ; replay de session : consentement | |

---

## 7. Prospection commerciale

**Base** : article L34-5 du Code des postes et des communications électroniques (CPCE), RGPD.

| Canal | Particuliers (B2C) | Professionnels (B2B) |
|---|---|---|
| E-mail, SMS, MMS | **Consentement préalable** (case non pré-cochée), sauf client existant pour des produits ou services analogues, avec possibilité de s'opposer dès la collecte | Information + droit d'opposition, si le message est en rapport avec la profession |
| Téléphone | **Consentement préalable** (opt-in) depuis le **11 août 2026** (loi n° 2025-594 du 30 juin 2025, art. L223-1 C. conso réécrit) : libre, spécifique, éclairé, univoque, révocable, prouvé ; sauf contrat en cours. Bloctel ne suffit plus | Régime d'opposition (vérifier l'application aux pros) |
| Courrier postal | Opposition | Opposition |

Chaque message : identité de l'expéditeur, **lien de désinscription** simple et gratuit, objet non trompeur.

**Pixels de suivi dans les e-mails** (recommandation CNIL publiée le 14 avril 2026) : ce sont des traceurs au sens de l'article 82. Le **consentement** est requis notamment pour un usage publicitaire ou commercial (taux d'ouverture marketing, profilage), recueilli de préférence lors de la collecte de l'adresse ; deux exceptions limitées (voir la FAQ CNIL). Fin de la période de transition pour les adresses déjà collectées : **14 juillet 2026**. À vérifier dans l'outil d'e-mailing (Brevo, Mailchimp…) : désactiver le suivi des ouvertures sans consentement.

---

## 8. Mineurs

- En France, un mineur peut consentir seul au traitement de ses données pour un service en ligne à partir de **15 ans** ; en dessous, le consentement conjoint du mineur et du titulaire de l'autorité parentale est requis (art. 45 loi I&L). Le seuil varie de 13 à 16 ans selon les pays de l'UE.
- Information adaptée à l'âge.
- Pas de profilage publicitaire des mineurs sur les plateformes en ligne (DSA, art. 28).

---

## 9. Transferts hors UE

Tout outil qui envoie des données hors de l'Espace économique européen (beaucoup d'outils américains) :
- **États-Unis** : possible vers les entreprises certifiées **EU-US Data Privacy Framework** (décision d'adéquation de juillet 2023), à vérifier sur dataprivacyframework.gov ; sinon clauses contractuelles types + analyse d'impact du transfert.
- Pays reconnus adéquats : Royaume-Uni, Suisse, Japon, Corée du Sud, Canada (secteur commercial), Israël, Nouvelle-Zélande, Argentine, Uruguay, etc.
- Mentionner les transferts et les garanties dans la politique de confidentialité.
- Préférer les hébergements et outils situés dans l'UE quand c'est possible.

---

## 10. Sanctions

- RGPD : jusqu'à **20 M€ ou 4 %** du chiffre d'affaires annuel mondial.
- Cookies (art. 82) : la CNIL sanctionne sur ce fondement, avec des montants élevés pour les grands acteurs ; elle dispose aussi d'une procédure simplifiée pour les petits acteurs (amendes jusqu'à 20 000 €) et contrôle massivement les bandeaux.
- Prospection sans consentement : sanctions CNIL et DGCCRF.
