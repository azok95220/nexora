# Applis mobiles : droit applicable, exigences des stores et tests

Une appli est soumise aux mêmes lois qu'un site (RGPD, consommation, accessibilité, DSA, AI Act). S'y ajoutent les règles d'Apple et de Google, qui entraînent un **refus, un blocage des mises à jour ou un retrait** en cas de manquement : c'est souvent le premier risque concret.

Toutes les technologies sont couvertes par `scripts/audit_mobile.py` : **Flutter (Dart), React Native, Expo, iOS natif (Swift, Objective-C), Android natif (Kotlin, Java), Capacitor / Ionic, Cordova, .NET MAUI, Kotlin Multiplatform**.

## 1. Droit applicable

- **Traceurs dans les applis** : l'article 82 de la loi Informatique et Libertés s'applique aussi aux SDK (publicité, mesure d'audience, attribution). La CNIL a publié une recommandation sur les applications mobiles : consentement avant d'activer les SDK non essentiels, information claire, permissions demandées au moment utile et justifiées. *(cnil.fr indisponible le 19/11/2026 : date et détails à revérifier, voir `veille.md`.)*
- **L'autorisation d'Apple (App Tracking Transparency) ne remplace pas le consentement** : elle ne couvre que le suivi entre applis et sites d'autres entreprises, pas la mesure d'audience ni la publicité dans l'appli. Il faut un écran de consentement par finalité (outil de consentement : Google UMP, Didomi, Axeptio, Usercentrics, OneTrust…), avec « Refuser » aussi simple qu'« Accepter ».
- **Permissions** (localisation, contacts, caméra, micro, photos) : seulement si nécessaires, expliquées, demandées en contexte.
- **Mentions légales, politique de confidentialité et CGU/CGV** : accessibles **dans l'appli** (écran « Paramètres » ou « À propos ») et sur la fiche du store.
- **Achats intégrés et abonnements** : prix, durée et renouvellement automatique affichés avant l'achat, résiliation expliquée (via le store si l'abonnement passe par Apple ou Google), voir `saas-plateformes.md`.
- **Accessibilité** : EAA si l'appli permet d'acheter (e-commerce, services aux consommateurs) ; viser WCAG 2.1 AA / EN 301 549 : taille du texte du système respectée, VoiceOver et TalkBack, contrastes, zones tactiles assez grandes.
- **Données de santé** (capteurs corporels, santé, bien-être) : avis juridique, hébergement certifié HDS si données de santé.

## 2. Apple App Store

Vérifié le 19/11/2026 sur developer.apple.com (guidelines mises à jour le 16/10/2026 ; une partie du texte a été lue sous forme de résumé : fiabilité moyenne).

| Exigence | Règle | Ce que le skill vérifie |
|---|---|---|
| **Lien vers la politique de confidentialité** dans App Store Connect **et** dans l'appli | 5.1.1(i) | Lien trouvé dans le code ou les textes (M5) |
| **App Privacy** (« étiquettes » de la fiche) : données collectées, y compris par les SDK | App Store Connect | Liste des SDK à comparer à la fiche (M1) |
| **Manifeste de confidentialité** `PrivacyInfo.xcprivacy` : raison approuvée pour chaque API sensible ; les SDK courants doivent fournir le leur (signé s'ils sont livrés compilés). Exigé pour publier depuis le printemps 2024 | Annonce Apple du 07/12/2023 | Fichier présent (M1) ; Expo : `ios.privacyManifests` |
| **App Tracking Transparency** : autorisation explicite avant tout suivi | 5.1.2(i) | SDK publicitaires sans ATT ni `NSUserTrackingUsageDescription` (M2) |
| **Suppression du compte dans l'appli** si l'appli permet d'en créer un | 5.1.1(v) | Création de compte sans suppression repérée (M4) |
| **Connexion par un service tiers** (Google, Facebook) : proposer aussi une option équivalente qui limite les données au nom et à l'e-mail, permet de masquer l'e-mail et n'utilise pas les interactions pour la publicité sans accord (Se connecter avec Apple en est une) | 4.8 | Connexion tierce sans option équivalente (M4) |
| **Textes des demandes d'autorisation** (`NS…UsageDescription`) précis | 5.1.1 | Textes vides, courts ou vagues ; traduction française (M3) |
| **Applis pour enfants** (catégorie Kids) : pas d'analytics ni de publicité de tiers, sauf exceptions limitées | 1.3 | À vérifier à la lecture |
| **Statut de professionnel (trader, DSA)** à déclarer dans App Store Connect | Page « EU DSA trader requirements » | Question à l'utilisateur |
| **Contenus publiés par les utilisateurs / IA générative** : modération, signalement, blocage | 1.2 | À vérifier à la lecture |

## 3. Google Play

Vérifié le 19/11/2026 sur developer.android.com et support.google.com.

| Exigence | Ce que le skill vérifie |
|---|---|
| **Niveau d'API cible** : depuis le **31/08/2026**, nouvelles applis et mises à jour en **API 36** (Android 16) ou plus ; une appli existante sous l'**API 35** n'est plus proposée aux nouveaux utilisateurs des téléphones plus récents (prolongation possible jusqu'au 01/11/2026, déjà passée) | `targetSdk` dans `build.gradle(.kts)` ou `expo-build-properties` (M1) |
| **Section « Sécurité des données »** obligatoire pour **toutes** les applis, même celles qui ne collectent rien, en incluant les données des SDK tiers | Liste des SDK à comparer à la déclaration (M1) |
| **Suppression du compte** : dans l'appli **et** par un lien web, sans avoir à réinstaller l'appli | Suppression repérée dans le code (M4) ; lien web : question |
| **Écran d'information avant la demande** quand l'usage des données peut surprendre (localisation en arrière-plan notamment) : il doit précéder immédiatement la demande d'autorisation | Localisation en arrière-plan sans écran repéré (M3) |
| **Permissions très sensibles** (SMS, journal d'appels, liste des applis installées, tous les fichiers, localisation en arrière-plan) : déclaration spéciale dans la Play Console | Liste des permissions (M3) |
| **Statut de trader** : à déclarer (nouveaux comptes dès la création, comptes existants avant le **01/02/2027**) ; sinon blocage des mises à jour et retrait de Google Play **dans le monde entier** | Question à l'utilisateur |
| **Familles** : règles spécifiques si l'appli vise des enfants (SDK certifiés, pas d'identifiant publicitaire) | À vérifier à la lecture |

## 4. Firebase et SDK courants

- **Firebase Analytics** collecte par défaut : pour attendre le consentement, `FIREBASE_ANALYTICS_COLLECTION_ENABLED` = `false` dans `Info.plist`, `<meta-data android:name="firebase_analytics_collection_enabled" android:value="false" />` dans `AndroidManifest.xml` (React Native Firebase : `"analytics_auto_collection_enabled": false` dans `firebase.json`), puis `setAnalyticsCollectionEnabled(true)` après accord (le choix est mémorisé). Source : firebase.google.com/docs/analytics/configure-data-collection.
- **Publicité** (AdMob, Meta, AppLovin…) et **attribution** (AppsFlyer, Adjust, Branch) : consentement + ATT sur iOS ; Google UMP (`AdsConsent` en React Native, `ConsentInformation` en Flutter et natif) gère les deux.
- **Suivi des plantages** (Crashlytics, Sentry) : peut se passer de consentement s'il sert seulement au bon fonctionnement, sans identifiant publicitaire ni donnée personnelle inutile ; le citer dans la politique.

## 5. Sécurité propre aux applis

- **Tout ce qui est dans l'appli est public** : une clé dans le code, un `.env` déclaré comme ressource (`flutter_dotenv`), une variable `EXPO_PUBLIC_…` ou `react-native-config` peut être extraite de l'appli publiée. Les secrets restent sur un serveur ; une clé « publique » (Firebase, Maps) doit être restreinte à l'appli.
- **Jetons et mots de passe** dans le trousseau sécurisé (`flutter_secure_storage`, `expo-secure-store`, `react-native-keychain`, Keychain iOS, `EncryptedSharedPreferences`), jamais dans `AsyncStorage`, `SharedPreferences` ou `UserDefaults`.
- **Trafic chiffré** : pas de `NSAllowsArbitraryLoads = true` (iOS), pas de `usesCleartextTraffic="true"` ni `cleartextTrafficPermitted="true"` (Android).
- **Jamais `android:debuggable="true"`** en production ; `allowBackup` : exclure jetons et données sensibles de la sauvegarde.
- **WebView** : pas de pont vers le code natif (`addJavascriptInterface`) ni d'origines `*` pour des pages non maîtrisées.

## 6. Tester l'appli lancée

Les tests navigateur du skill ne s'appliquent pas à une appli : lance-la sur un **simulateur iOS** (outil iOS Simulator de la session si disponible, sinon `xcrun simctl` / Xcode) ou un **émulateur Android** (`emulator`, Android Studio), avec l'accord de l'utilisateur, et vérifie :

1. **Premier lancement sans rien accepter** : aucune requête vers un SDK de suivi (proxy Proxyman, Charles ou mitmproxy ; ou journaux de Firebase en mode débogage : `-FIRDebugEnabled` sur iOS, `adb shell setprop debug.firebase.analytics.app <package>` sur Android) ; écran de consentement avec « Refuser » au même niveau qu'« Accepter ». Refaire après un refus.
2. **Demandes d'autorisation** : au moment où on en a besoin, avec une explication avant ; texte clair et en français.
3. **Paramètres** : liens vers la politique de confidentialité, les conditions et les mentions légales ; **suppression du compte** en quelques étapes, qui supprime vraiment les données.
4. **Accessibilité** : VoiceOver (iOS) ou TalkBack (Android) sur l'accueil, un formulaire et le parcours d'achat ; taille de texte maximale du système : rien n'est coupé ; contrastes (`scripts/contrast.py`).
5. **Fiche du store** : « App Privacy » et « Sécurité des données » cohérentes avec les SDK trouvés ; politique de confidentialité en ligne ; statut de trader déclaré.

Si l'appli ne peut pas être lancée, les points concernés sont ❓ avec la raison, et l'utilisateur peut faire ces vérifications sur son téléphone.
