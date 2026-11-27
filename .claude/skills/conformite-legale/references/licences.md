# Licences et propriété intellectuelle

Base : Code de la propriété intellectuelle (droit d'auteur, art. L122-4 : toute reproduction sans autorisation est une contrefaçon, jusqu'à 3 ans et 300 000 € d'amende, art. L335-2), droit des marques, licences open source.
Les mises en demeure pour des **photos** utilisées sans licence (agences qui scannent le web) et des **polices** commerciales sont fréquentes, même pour de petits sites.

## Polices
| Source | Statut |
|---|---|
| Google Fonts | Licence libre (OFL ou Apache) : usage web et commercial autorisé. Héberger les fichiers localement (RGPD). |
| Fontsource, Bunny Fonts | Mêmes polices, licences libres |
| Polices système | OK |
| Polices achetées (MyFonts, Adobe, foundries) | Licence **web** distincte de la licence bureau, souvent limitée en pages vues ou en domaines : demander la facture ou la licence |
| Adobe Fonts | Uniquement via le kit Adobe, tant que l'abonnement est actif ; pas d'auto-hébergement |
| Fichiers `.woff`, `.ttf`, `.otf` d'origine inconnue | ❓ À justifier |

## Images, vidéos et musique
| Source | Statut |
|---|---|
| Unsplash, Pexels, Pixabay | Licence permissive, crédit apprécié mais non obligatoire ; pas d'usage des personnes reconnaissables pour un message qu'elles n'approuveraient pas ; pas de revente telle quelle |
| Banques payantes (Shutterstock, Adobe Stock, Getty) | Conserver la preuve d'achat ; vérifier la licence (standard ou étendue) |
| Wikimedia Commons, Creative Commons | Respecter la licence : crédit **obligatoire** (auteur, licence, lien), CC BY-NC interdit l'usage commercial, CC BY-SA impose le partage à l'identique |
| Images trouvées sur Google, Pinterest, Instagram, sites concurrents | ❌ Pas de droit d'usage |
| Photos de personnes | Droit à l'image : autorisation écrite des personnes reconnaissables |
| Images générées par IA | Vérifier les conditions du générateur (usage commercial autorisé ?) ; pas de reprise d'une œuvre ou d'un personnage protégé, ni d'une marque ; mention « image générée par IA » si elle peut tromper (deepfake, AI Act art. 50) |
| Musique | Licence de synchronisation ; les morceaux du commerce sont interdits sans droits (SACEM) |
| Logos de tiers | Logos clients ou partenaires : avec leur accord ; logos de paiement : selon les règles d'usage des marques |

## Icônes
- Font Awesome Free (CC BY 4.0 pour les icônes, crédit inclus dans les fichiers), Lucide, Heroicons, Material Icons, Tabler, Phosphor : libres.
- **Font Awesome Pro**, packs d'icônes payants : licence nécessaire, ne pas commiter le kit privé dans un dépôt public.

## Code et dépendances
- Licences permissives (MIT, BSD, Apache-2.0, ISC) : conserver les mentions de copyright (souvent via le bundle ou une page « Licences tierces » dans les applis).
- **GPL** : pas de problème pour un site servi par un serveur ; contraignant pour une appli distribuée (mobile, desktop) — code source à fournir.
- **AGPL** : contamine aussi un service en ligne modifié ; à signaler.
- Paquets sans licence (`UNLICENSED`) ou licence propriétaire : vérifier l'autorisation.
- Thèmes et templates achetés (ThemeForest, Tailwind UI) : licence par projet, souvent interdiction de redistribution en open source.
- **Tester** : `audit_static.py` liste les licences des dépendances installées (`node_modules/*/package.json`) et signale GPL, AGPL, sans licence.

## Textes
- Pas de copie de textes d'autres sites (y compris des CGV d'un concurrent : elles sont protégées et souvent inadaptées).
- Contenus rédigés par un prestataire : cession de droits écrite.

## Marques et noms
- Nom de domaine ou nom commercial identique ou proche d'une marque déposée dans le même secteur : risque de contrefaçon. Vérifier sur data.inpi.fr et la base EUIPO.

## Actions dans le rapport
Pour chaque ressource dont la licence n'est pas démontrable : statut ❓ et action « fournir la licence ou remplacer par [alternative libre] ». Proposer des remplacements concrets (police Google équivalente, image Unsplash, icône Lucide).
