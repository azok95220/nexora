# International

Une loi étrangère s'applique en général quand le site **vise** les habitants d'un pays : langue, devise, livraison, publicité ciblée, nom de domaine local, ou volume significatif d'utilisateurs de ce pays. Un site en français pour la France n'a pas à appliquer le droit californien ; un SaaS en anglais vendu dans le monde, si.

Stratégie pratique pour un projet mondial : appliquer le **socle RGPD** (le plus exigeant en général), puis ajouter les spécificités ci-dessous pour chaque marché visé.

## Sommaire
1. Royaume-Uni
2. Suisse
3. États-Unis
4. Canada et Québec
5. Autres pays
6. Accessibilité hors UE

---

## 1. Royaume-Uni

- **UK GDPR + Data Protection Act 2018** : très proche du RGPD. Un éditeur sans établissement au Royaume-Uni qui vise ce marché doit désigner un **représentant UK**.
- **PECR** (cookies et marketing), modifiée par le **Data (Use and Access) Act 2025** (dispositions en vigueur depuis le 5 février 2026) : certains cookies à faible risque (statistiques **agrégées** sur le site, sécurité, fonctionnalités, mises à jour) peuvent être déposés sans consentement, à condition d'**informer** et de permettre de **s'opposer** facilement. Publicité, profilage et suivi entre sites restent soumis au consentement. Les amendes PECR sont désormais alignées sur celles du UK GDPR.
- Adéquation : le Royaume-Uni bénéficie d'une décision d'adéquation de l'UE, les transferts UE → UK sont libres.
- Consommation : Consumer Contracts Regulations (rétractation 14 jours), Digital Markets, Competition and Consumers Act 2024 (abonnements, faux avis, prix d'appel).

## 2. Suisse

- **nLPD** (nouvelle loi sur la protection des données, en vigueur depuis le 1er septembre 2023) : déclaration de confidentialité obligatoire, registre des traitements (sauf petites structures à faible risque), notification des violations au PFPDT, représentant en Suisse pour certains éditeurs étrangers. Amendes **personnelles** (jusqu'à 250 000 CHF) visant les responsables.
- Cookies : régime d'opposition (opt-out) en général, consentement pour les données sensibles et le profilage à risque élevé. Un bandeau conforme RGPD convient.
- Mentions : la loi contre la concurrence déloyale (LCD) exige l'identité et l'adresse du vendeur pour le commerce en ligne.

## 3. États-Unis

Pas de loi fédérale générale. Patchwork de lois d'États et de lois sectorielles.

- **Californie : CCPA / CPRA** — s'applique si l'entreprise dépasse un seuil de chiffre d'affaires annuel (environ 26 M$, montant indexé), ou traite les données de 100 000 consommateurs ou foyers californiens, ou tire 50 % de son CA de la vente ou du partage de données. Obligations : politique de confidentialité détaillée (catégories, sources, finalités, droits, mise à jour annuelle), lien **« Do Not Sell or Share My Personal Information »** (et « Limit the Use of My Sensitive Personal Information » le cas échéant) si vente ou partage publicitaire, respect du signal **Global Privacy Control (GPC)**, réponse aux demandes sous 45 jours.
- **Autres États** : plus d'une quinzaine de lois sur le même modèle (Virginie, Colorado, Connecticut, Utah, Texas, Oregon, Montana, Delaware, Iowa, New Jersey, New Hampshire, Tennessee, Minnesota, Maryland, Indiana, Kentucky, Rhode Island…). Socle commun : politique de confidentialité, droits d'accès et de suppression, opt-out de la publicité ciblée et de la vente, consentement pour les données sensibles, respect du GPC dans plusieurs États. Les seuils varient.
- **COPPA** (enfants de moins de 13 ans) : consentement parental vérifiable avant toute collecte ; règles FTC renforcées en 2025.
- **CAN-SPAM** : identité de l'expéditeur, adresse postale, désinscription fonctionnelle traitée sous 10 jours ouvrés.
- **Renouvellements automatiques** : la règle fédérale « click-to-cancel » de la FTC a été annulée en justice en juillet 2025, mais les lois des États (Californie notamment) imposent une information claire, un consentement exprès et une **résiliation en ligne** aussi simple que la souscription.
- **Accessibilité : ADA** — les tribunaux appliquent l'ADA aux sites web ; des milliers de procès par an. Cible **WCAG 2.1 AA** (2.2 recommandé).
- **CalOPPA** : politique de confidentialité visible pour tout site collectant des données de résidents californiens, avec la mention de la gestion des signaux « Do Not Track ».

## 4. Canada et Québec

- **Fédéral : LPRPDE / PIPEDA** : consentement valable, politique de confidentialité, responsable désigné. Une réforme (C-27) n'a pas abouti à ce jour.
- **Québec : Loi 25** (entièrement en vigueur depuis septembre 2024) : **responsable de la protection des renseignements personnels** désigné et publié, politique de confidentialité en termes simples, **paramètres les plus protecteurs par défaut** (traceurs désactivés par défaut), évaluation des facteurs relatifs à la vie privée avant un transfert hors Québec, notification des incidents. Amendes jusqu'à 25 M$ CA ou 4 % du CA mondial. Charte de la langue française : site commercial en français.
- **CASL / LCAP** (anti-pourriel) : consentement exprès ou tacite documenté, identification, désinscription.

## 5. Autres pays

| Pays | Loi | Points clés |
|---|---|---|
| Brésil | LGPD | Proche du RGPD, DPO (« encarregado ») à désigner, ANPD |
| Inde | DPDP Act 2023 + Rules 2025 | Entrée en application progressive jusqu'en 2027 ; avis clair, consentement, consentement parental pour les moins de 18 ans |
| Chine | PIPL | Consentement séparé pour les transferts hors de Chine, localisation de certaines données ; avis juridique local indispensable |
| Japon | APPI | Information sur les finalités, consentement pour les transferts à l'étranger |
| Corée du Sud | PIPA | Consentement détaillé, très strict |
| Australie | Privacy Act 1988 (réformé en 2024) | Australian Privacy Principles, politique de confidentialité ; seuil de 3 M AU$ de CA |
| Turquie | KVKK | Information, consentement explicite pour les transferts |
| Afrique du Sud | POPIA | Information Officer à enregistrer |

Pour ces pays, signale dans le rapport qu'un **avis juridique local** est recommandé si le marché est significatif.

## 6. Accessibilité hors UE

- États-Unis : ADA (voir plus haut), Section 508 pour le secteur public.
- Canada : Accessible Canada Act (fédéral), AODA (Ontario).
- Royaume-Uni : Equality Act 2010, règlements d'accessibilité du secteur public.
- Partout, **WCAG 2.1 AA** (2.2 de préférence) est la cible raisonnable.
