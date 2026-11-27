# Spécification du bandeau de consentement

Ce document décrit ce que le bandeau doit faire, quelle que soit la stack. Si le projet utilise déjà un outil (Axeptio, Didomi, tarteaucitron.js, Cookiebot, OneTrust, Klaro, orestbida/cookieconsent…), configure-le selon ces règles au lieu d'en recoder un. Pour un petit site, une implémentation maison légère est acceptable si elle respecte tout ce qui suit.

## Premier niveau (affiché à la première visite)

- Texte court : qui dépose les traceurs, pour quoi faire (catégories), et que le choix peut être modifié à tout moment.
- Trois actions **de même taille, même style, même niveau** :
  - **Tout accepter**
  - **Tout refuser**
  - **Personnaliser**
- Pas de croix qui vaut acceptation. Une croix de fermeture vaut **refus**.
- Lien vers la politique cookies.
- Le bandeau ne doit pas masquer les liens légaux ; il doit être accessible au clavier et au lecteur d'écran (focus placé dans le bandeau, rôle `dialog`, libellés explicites).

## Second niveau (« Personnaliser »)

- Une bascule par **finalité** (mesure d'audience, publicité, réseaux sociaux, contenus intégrés), toutes **désactivées par défaut**.
- Catégorie « Strictement nécessaires » affichée comme toujours active, non modifiable.
- Liste des tiers par finalité (ou lien vers la liste).
- Boutons « Tout accepter », « Tout refuser », « Enregistrer mes choix ».

## Comportement technique

1. **Blocage préalable** : aucun script, pixel, iframe ou SDK soumis au consentement n'est chargé avant le choix. Techniques possibles :
   - scripts marqués `type="text/plain" data-category="analytics"`, activés par l'outil de consentement ;
   - chargement conditionnel dans le code (`if (consent.analytics) loadAnalytics()`) ;
   - Google Consent Mode v2 en mode **basic** (balises Google non chargées avant consentement). Le mode « advanced » envoie des pings sans cookie avant consentement : à éviter en France, ou à faire valider.
2. **Stockage du choix** : cookie ou localStorage `consent` contenant les catégories acceptées, la date et la version du bandeau. Durée : 6 mois, puis nouvelle demande.
3. **Refus respecté** : ne pas redemander à chaque page ni à chaque visite pendant la durée de conservation du choix.
4. **Retrait** : lien « Gérer mes cookies » dans le pied de page de toutes les pages, qui rouvre le second niveau. Au retrait d'un consentement, supprimer les cookies concernés et cesser de charger les scripts.
5. **Nouvelle version** : si un nouveau traceur ou une nouvelle finalité est ajouté, incrémenter la version et redemander le consentement.
6. **Preuve** : conserver la trace du consentement (date, version, choix), côté serveur si possible.
7. **Contenus intégrés** : remplacer chaque iframe YouTube, Maps ou réseau social par un aperçu statique avec un bouton « Charger le contenu (dépose des cookies [fournisseur]) ».

## Tests à faire

- Navigation privée, refuser tout : aucun cookie hors nécessaires (onglet Application des DevTools), aucune requête vers les domaines publicitaires ou analytiques non exemptés (onglet Network).
- Accepter tout, puis retirer via « Gérer mes cookies » : les scripts ne se rechargent plus.
- Clavier seul : on peut accepter, refuser et personnaliser.
