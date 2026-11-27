# Pratiques commerciales trompeuses et dark patterns

Base : Code de la consommation L121-1 à L121-7 (pratiques trompeuses et agressives ; L121-4 liste les pratiques **réputées trompeuses en toutes circonstances**), directive 2005/29/CE, DSA art. 25 (interfaces trompeuses sur les plateformes), directive (UE) 2024/825 sur les allégations environnementales.
Sanctions (L132-2) : jusqu'à 2 ans d'emprisonnement et 300 000 € d'amende (montant porté jusqu'à 10 % du CA annuel moyen), quintuplé pour les personnes morales ; contrôles DGCCRF fréquents en ligne.

## 1. Dark patterns à détecter et corriger

| Pratique | Exemple | Correction |
|---|---|---|
| **Fausse urgence** | Minuteur « l'offre expire dans 10 min » qui se réinitialise à chaque visite | Minuteur seulement si l'offre a une vraie date de fin, identique pour tous |
| **Fausse rareté** | « Plus que 2 en stock ! » codé en dur ou aléatoire | Afficher le stock réel ou rien |
| **Fausse popularité** | « 23 personnes regardent ce produit » inventé | Supprimer ou brancher sur une donnée réelle et vérifiable |
| **Cases pré-cochées** | Assurance, newsletter, don ajoutés par défaut | Toujours décoché, option volontaire |
| **Ajout au panier furtif** | Produit ou option ajouté sans action | Interdit (pratique réputée trompeuse) |
| **Culpabilisation** (« confirmshaming ») | « Non merci, je préfère payer plein tarif » | Libellé neutre : « Non merci » |
| **Désabonnement caché** | Résiliation par téléphone uniquement, parcours en 8 étapes | Fonction « Résilier votre contrat » (voir `saas-plateformes.md`) |
| **Asymétrie de choix** | « Accepter » en gros bouton, « Refuser » en lien gris | Même mise en valeur |
| **Harcèlement** | Pop-up qui revient à chaque page après un refus | Respecter le choix |
| **Prix en plusieurs temps** (« drip pricing ») | Frais de service ajoutés à la dernière étape | Prix total dès le départ, frais annoncés |
| **Abonnement déguisé** | « Essai gratuit » qui bascule en abonnement sans information claire | Prix, date de facturation et annulation expliqués avant validation |

**Repérage dans le code** (`audit_static.py`) : `setInterval` / `countdown` / « expire », valeurs de stock aléatoires (`Math.random` près de « stock » ou « restant »), compteurs de visiteurs, `checked` / `defaultChecked` sur des options payantes ou marketing.

## 2. Avis clients (L111-7-2, D111-17)

- Indiquer **si les avis font l'objet d'un contrôle** et, si oui, ses principales caractéristiques (achat vérifié, modération, délais).
- Afficher la **date** de chaque avis et, en cas de publication différée, la durée.
- Indiquer les **raisons du rejet** possibles.
- Ne pas publier, commander ou rédiger de **faux avis**, ne pas supprimer sélectivement les avis négatifs, ne pas présenter des avis d'un autre produit (pratiques réputées trompeuses depuis la directive Omnibus).
- Avis incentivés (contre réduction) : le signaler.
- Texte type : « Les avis sont publiés par des clients ayant acheté le produit. Ils sont contrôlés par [moyen] avant publication, sous [délai]. Un avis peut être refusé s'il est injurieux, hors sujet ou sans lien avec une expérience d'achat. »

## 3. Allégations

### Allégations commerciales
À justifier par des preuves que l'éditeur peut produire à tout moment :
- « n°1 », « leader », « meilleur », « le moins cher » : seulement avec une source datée et vérifiable citée à côté ;
- « résultats garantis », « 100 % de réussite », « gagnez 5 000 €/mois » : interdits sans preuve ; pour la santé, la finance, la formation, risque élevé ;
- chiffres (nombre de clients, note moyenne, gains) : source et date ;
- « gratuit » : seulement si aucun coût caché ;
- comparaison avec un concurrent nommé (publicité comparative, L122-1) : objective, vérifiable, portant sur des caractéristiques essentielles.

### Allégations environnementales
- **Directive (UE) 2024/825** (à appliquer depuis le 27 septembre 2026 ; **pas encore transposée en France** au 18/11/2026 : projet de loi DDADUE adopté au Sénat en février 2026, mise en demeure de la Commission le 28 mai 2026. Une directive ne s'applique pas directement entre particuliers : en attendant, la DGCCRF poursuit sur les pratiques trompeuses existantes (L121-1 s.) et le Code de l'environnement. Recommande d'appliquer déjà ces règles) : interdiction des allégations environnementales **génériques** non démontrées (« écologique », « vert », « respectueux de l'environnement », « éco-responsable »), des allégations de neutralité carbone fondées sur la **compensation**, et des labels de durabilité non certifiés.
- France (loi Climat et Résilience) : « neutre en carbone » et équivalents interdits sauf bilan d'émissions et conditions strictes (L229-68 Code de l'environnement) ; « biodégradable », « respectueux de l'environnement » interdits sur les produits et emballages (loi AGEC).
- **Correction** : remplacer par une allégation précise et prouvée (« emballage composé à 80 % de carton recyclé, certifié [label] »), ou supprimer.

## 4. Repérage textuel

`audit_static.py` signale ces motifs dans les textes du site, à examiner au cas par cas (beaucoup seront légitimes) :
n°1, numéro 1, leader, meilleur, le moins cher, garanti, 100 %, résultats, sans risque, gratuit, écologique, éco-responsable, vert, neutre en carbone, zéro émission, biodégradable, plus que X en stock, dernière chance, expire, compte à rebours, personnes regardent.
