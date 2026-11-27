# Hébergeurs et prestataires : offre gratuite, usage pro, contrat de données

Pourquoi : une offre gratuite peut **interdire un usage commercial** (le site d'une entreprise est un usage commercial), et le **contrat de traitement des données** (DPA, article 28 du RGPD) peut ne couvrir que les offres payantes. C'est invisible dans le code : il faut détecter l'hébergeur, **demander l'offre utilisée**, puis comparer avec ce tableau.

**Vérifié en ligne le 19/11/2026** sur les conditions officielles de chaque prestataire (URL dans la dernière colonne). Les conditions changent souvent : revérifier tous les 3 mois (voir `veille.md`). « Non vérifié » veut dire que la page officielle n'a pas pu être lue ou ne répond pas à la question : ne pas conclure, demander à l'utilisateur de regarder son contrat.

## 1. Hébergeurs

| Hébergeur | Offre gratuite | Site pro autorisé en gratuit ? | Contrat de données (DPA) | Où sont les données | Source lue le 19/11/2026 |
|---|---|---|---|---|---|
| **Vercel** | Hobby | ❌ **Non** : « personal or non-commercial use » (CGU §4, version du 19/10/2026) → offre Pro payante | ❌ Le DPA vise « Enterprise and Pro plans » (DPA du 17/03/2026) ; transferts par clauses types 2021/914 | États-Unis + réseau mondial | vercel.com/legal/terms · vercel.com/legal/dpa |
| **Cloudflare** (Workers, Pages) | Free | ✅ Oui : pas d'interdiction d'usage commercial ; interdit seulement de revendre le service, et de collecter des numéros de carte bancaire sur un site en offre gratuite (§2.2.1 h) | ✅ Intégré par référence à la convention self-serve (§6.1), toutes offres ; clauses types + Data Privacy Framework (DPA v6.4 du 03/04/2026) | Réseau mondial, société aux États-Unis | cloudflare.com/terms · cloudflare.com/cloudflare-customer-dpa |
| **Netlify** | Free | ❓ Non vérifié (convention self-serve en PDF illisible) ; la page tarifs présente l'offre Free pour « Individual » sans interdiction écrite | 🟠 « Our DPA is incorporated by reference » dans les conditions ; application à l'offre gratuite non écrite | États-Unis + réseau mondial | netlify.com/pricing · netlify.com/gdpr-ccpa |
| **GitHub Pages** | Gratuit | ❌ **Non** pour une activité commerciale : pas un hébergement gratuit pour faire tourner « your online business, e-commerce site » | ❌ Le DPA de GitHub vise Enterprise Cloud, Team et Copilot, pas les comptes gratuits | États-Unis | docs.github.com/en/pages/…/github-pages-limits · github.com/customer-terms |
| **Firebase Hosting** (Google) | Spark | 🟠 Pas de restriction trouvée pour Spark ; les conditions Firebase demandent un usage professionnel | ✅ « Firebase Data Processing and Security Terms » listés pour Hosting (version du 21/08/2024) ; application à Spark non écrite | Tout pays où Google a des installations (§10.1) | firebase.google.com/terms · firebase.google.com/terms/data-processing-terms |
| **AWS** (Amplify, S3 + CloudFront) | Crédits jusqu'à 200 $ pendant 6 mois + services « toujours gratuits » dans des limites | ✅ Oui (offre commerciale classique) | ✅ « These Service Terms incorporate the AWS Data Processing Addendum » (§1.14.1, version du 17/11/2026), sans distinction d'offre | Région au choix (ex. Paris `eu-west-3`) | aws.amazon.com/free · aws.amazon.com/service-terms |
| **Azure Static Web Apps** | Free | 🟠 Présentée « For personal projects » (le Standard « For production apps ») : recommandation, pas d'interdiction écrite ; pas d'engagement de disponibilité | ❓ DPA Microsoft existant, application à l'offre Free non vérifiée | Non indiqué sur la page | learn.microsoft.com/…/static-web-apps/plans |
| **Render** | Free | 🟠 Pas d'interdiction trouvée, mais « Do not use them for production applications » ; mise en veille après 15 min sans visite | ❓ Page DPA sans texte lisible | Oregon, Ohio, Virginie, **Francfort**, Singapour | render.com/docs/free · render.com/docs/regions |
| **OVHcloud** (France) | Pas d'hébergement web gratuit | ✅ Oui | ❓ Non vérifié en ligne (pages lues sans texte juridique) : demander à l'utilisateur l'annexe « traitement de données » de son contrat | France / UE (à confirmer pour l'offre) | ovhcloud.com/fr/terms-and-conditions/contracts |
| **o2switch** (France) | Non | ✅ Oui | 🟠 Les CGV (version 2019) disent qu'o2switch « agit… en tant que sous-traitant du Client » ; « Document unique RGPD » à consulter | Société à Clermont-Ferrand ; lieu des serveurs non écrit dans les CGV | o2switch.fr/cgv |
| **IONOS** | Non vérifié | ✅ Oui | ✅ Contrat de sous-traitance (article 28) « partie intégrante des CGV » | UE/EEE par défaut (art. 4.3 du contrat) ; contractant en France : IONOS SARL | ionos.fr/terms-gtc/data-processing-agreement-dpa |
| **Hostinger** | Non (services payants par abonnement) | ✅ Oui | ✅ DPA « annexed to and supplements our Terms of Service » | Non précisé, sous-traitants AWS, Google Cloud, Cloudflare ; contractant pour l'UE à Chypre | hostinger.com/legal/dpa |

## 2. Services d'e-mail et autres prestataires gratuits

| Service | Fait vérifié le 19/11/2026 | Source |
|---|---|---|
| **Resend** (envoi) | DPA intégré aux conditions, contraignant dès l'inscription (signature non requise). Gratuit : 3 000 e-mails/mois, **100 par jour**, 3 domaines. Région Irlande (`eu-west-1`) disponible, mais les données du compte restent aux États-Unis. Après un rebond définitif, l'adresse va dans la **liste de suppression** et plus rien ne lui est envoyé | resend.com/legal/dpa · resend.com/pricing · resend.com/docs/dashboard/domains/regions · resend.com/docs/dashboard/emails/email-suppressions |
| **Google Workspace** | Contrat de traitement des données (Cloud Data Processing Addendum) intégré au contrat | cloud.google.com/terms/data-processing-addendum |
| **Gmail gratuit** (@gmail.com) | Aucune source officielle trouvée qui le couvre par un DPA : le traiter comme **sans contrat de sous-traitance** (🟠) et conseiller une messagerie pro | policies.google.com/terms |
| **Cloudflare Email Routing** (redirection) | Gratuit sur toutes les offres ; MX dans la zone `*.mx.cloudflare.net` ; couvert par le DPA Cloudflare | developers.cloudflare.com/email-routing |
| **Namecheap Email Forwarding** | Gratuit, jusqu'à 100 redirections ; MX posés automatiquement (noms non publiés dans l'aide) ; DPA non vérifié | namecheap.com/support/knowledgebase/article.aspx/308/2214 |
| **ImprovMX** | DPA non trouvé (page `/dpa/` introuvable) : demander à l'utilisateur | improvmx.com |
| **Cloudflare Workers Free** (limites) | 100 000 requêtes par jour, 10 ms de calcul par requête ; au-delà, **erreur 1027** (requêtes) ou 1102 (calcul), aucun passage automatique au payant décrit ; fichiers statiques gratuits et illimités | developers.cloudflare.com/workers/platform/limits · …/pricing |

## 3. Comment reconnaître l'hébergeur

`check_headers.py` affiche « Hébergeur détecté » à partir des en-têtes et de l'adresse IP réellement contactée. Indices dans le code et en ligne :

| Hébergeur | Dans le projet | En-têtes / DNS |
|---|---|---|
| Vercel | `vercel.json`, `.vercel/` | `x-vercel-id`, `server: Vercel` ; IP `76.76.21.x`, `216.198.79.x` ; CNAME `*.vercel-dns*.com` |
| Cloudflare | `wrangler.toml`, `wrangler.json(c)`, `_headers` + `_routes.json` | `server: cloudflare`, `cf-ray` ; IP 104.16.0.0/13, 104.24.0.0/14, 172.64.0.0/13, 188.114.96.0/20… |
| Netlify | `netlify.toml`, `_redirects` | `x-nf-request-id`, `server: Netlify` ; CNAME `*.netlify.app` |
| GitHub Pages | `CNAME` à la racine, workflow `pages` | `server: GitHub.com`, `x-github-request-id` ; IP 185.199.108-111.153 |
| Firebase | `firebase.json`, `.firebaserc` | `x-served-by` (Fastly) + `*.web.app` / `*.firebaseapp.com` |
| AWS | `amplify.yml`, `serverless.yml`, `template.yaml` | `x-amz-cf-id`, `x-amz-*`, `server: AmazonS3` |
| Azure SWA | `staticwebapp.config.json` | `x-azure-ref` ; `*.azurestaticapps.net` |
| Render | `render.yaml` | `x-render-origin-server`, `rndr-id` ; `*.onrender.com` |
| Railway / Fly.io | `railway.json`, `fly.toml` | `x-railway-*`, `fly-request-id`, `server: Fly` |
| OVH, o2switch, IONOS, Hostinger | `.htaccess`, PHP, WordPress | `server: Apache`/`LiteSpeed`, propriétaire de l'IP (`whois <ip>`) |

Un CDN (Cloudflare devant OVH, par exemple) masque l'hébergeur d'origine : les deux sont alors des prestataires à citer (l'hébergeur dans les mentions légales, le CDN dans la politique de confidentialité).

## 4. Ce que le skill en fait

1. **Détecter** l'hébergeur (code + `check_headers.py` + DNS) et **demander l'offre** (gratuite ou payante, laquelle).
2. **Classer** (catégorie 🖥️ Hébergement et prestataires du rapport) :
   - point **H1 Offre autorisée pour un pro** : ❌ si l'offre interdit l'usage commercial pour un site d'entreprise (Vercel Hobby, GitHub Pages pour une boutique ou un SaaS) ; 🟠 si l'offre est seulement « déconseillée en production » ou si ce n'est pas vérifié ; ✅ sinon ;
   - point **H2 Contrats de protection des données** : ✅ si un DPA couvre l'offre utilisée pour chaque prestataire (hébergeur, envoi d'e-mails, boîte de réception, outils) ; 🟠 s'il n'est pas certain ou manque pour un prestataire secondaire (Gmail gratuit) ; ❌ s'il manque pour l'hébergeur d'un site qui collecte des données ;
   - point **H3 Hébergeur annoncé = hébergeur réel** : comparer le nom et l'adresse de l'hébergeur des mentions légales avec l'hébergeur détecté ; ❌ si différent (mention obligatoire inexacte).
3. **Proposer une solution** si l'offre ne va pas : passer à l'offre payante, ou une alternative gratuite compatible (ex. Cloudflare Workers/Pages), en disant le travail que cela représente (migration, DNS, e-mail, mentions légales et politique à mettre à jour).
4. **Dire en mots simples** que les prestataires américains transfèrent des données hors d'Europe (encadré par le Data Privacy Framework ou les clauses types, voir `rgpd-cookies.md` §9) et que les hébergeurs européens évitent ce point.
