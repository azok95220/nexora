#!/usr/bin/env python3
"""Analyse une appli mobile (Flutter, React Native, Expo, iOS et Android natifs,
Capacitor/Ionic, Cordova, .NET MAUI, Kotlin Multiplatform) pour ce qui compte en
conformité et pour les stores : SDK de suivi et consentement, App Tracking
Transparency, permissions et leurs textes, manifeste de confidentialité Apple,
suppression du compte, liens légaux, stockage des jetons, trafic non chiffré,
fichier .env embarqué, niveau d'API Android, accessibilité (taille du texte,
boutons sans nom), achats intégrés.

Usage :
    python3 audit_mobile.py <projet> [--json] [--max 8]

Détection par motifs : chaque constat est à confirmer en lisant le code et en
lançant l'appli (simulateur iOS, émulateur Android). Bibliothèque standard uniquement.
"""

import argparse
import json
import os
import plistlib
import re
import sys

SKIP_DIRS = {"node_modules", ".git", "Pods", "build", ".dart_tool", ".gradle", "DerivedData", "dist", ".expo",
             "vendor", ".venv", "venv", "__pycache__", ".next", "coverage", "bin", "obj", ".idea", ".fvm",
             "ephemeral", ".symlinks", "Flutter", "intermediates", "generated"}
CODE_EXT = {".dart", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".swift", ".kt", ".kts", ".java", ".m", ".mm",
            ".cs", ".xaml", ".vue"}
STRING_EXT = {".arb", ".strings", ".stringsdict", ".xcstrings", ".resx"}
DEP_FILES = {"pubspec.yaml", "package.json", "Podfile", "Package.swift", "Package.resolved", "build.gradle",
             "build.gradle.kts", "libs.versions.toml", "app.json", "app.config.js", "app.config.ts", "capacitor.config.json",
             "capacitor.config.ts", "config.xml"}
MAX_BYTES = 1_000_000

# (nom, motif dans les dépendances ou le code, usage, consentement nécessaire ?, suivi publicitaire/entre applis ?)
SDKS = [
    ("Firebase Analytics", r"firebase_analytics|@react-native-firebase/analytics|FirebaseAnalytics|firebase-analytics|Firebase/Analytics", "mesure d'audience", True, False),
    ("Meta (Facebook) SDK", r"facebook_app_events|flutter_facebook_auth|react-native-fbsdk|FBSDKCoreKit|FacebookCore|facebook-android-sdk|com\.facebook\.android", "publicité, mesure, connexion", True, True),
    ("AppsFlyer", r"appsflyer", "attribution publicitaire", True, True),
    ("Adjust", r"adjust_sdk|react-native-adjust|com\.adjust\.sdk|['\"]Adjust['\"]", "attribution publicitaire", True, True),
    ("Branch", r"flutter_branch_sdk|react-native-branch|io\.branch|BranchSDK", "liens et attribution", True, True),
    ("Google Mobile Ads (AdMob)", r"google_mobile_ads|react-native-google-mobile-ads|Google-Mobile-Ads-SDK|play-services-ads(?!-identifier)|GoogleMobileAds", "publicité", True, True),
    ("AppLovin / ironSource / Unity Ads", r"applovin|ironsource|unity_ads|UnityAds|unity3d\.ads", "publicité", True, True),
    ("Mixpanel", r"mixpanel", "mesure d'audience", True, False),
    ("Amplitude", r"amplitude", "mesure d'audience", True, False),
    ("Segment", r"segment_analytics|@segment/|analytics-react-native", "mesure d'audience", True, False),
    ("PostHog", r"posthog", "mesure d'audience", True, False),
    ("Braze / CleverTap / Airship", r"braze|appboy|clevertap|urbanairship|airship", "marketing", True, False),
    ("OneSignal", r"onesignal", "notifications et mesure", True, False),
    ("Sentry", r"sentry", "suivi des plantages", False, False),
    ("Firebase Crashlytics", r"crashlytics", "suivi des plantages", False, False),
    ("Datadog / Bugsnag / Instabug / New Relic", r"datadog|bugsnag|instabug|newrelic", "suivi des plantages / performances", False, False),
    ("Firebase Cloud Messaging", r"firebase_messaging|@react-native-firebase/messaging|FirebaseMessaging|firebase-messaging", "notifications", False, False),
    ("Google Maps / Mapbox", r"google_maps_flutter|react-native-maps|GoogleMaps|play-services-maps|mapbox", "carte", False, False),
    ("RevenueCat", r"purchases_flutter|react-native-purchases|RevenueCat", "abonnements", False, False),
    ("Intercom / Zendesk / Crisp", r"intercom|zendesk|crisp_chat|crisp-sdk", "chat d'assistance", False, False),
]
CMP = re.compile(r"AdsConsent\.|user_messaging_platform|UserMessagingPlatform|ConsentInformation|ConsentForm|ConsentRequestParameters|didomi|axeptio|usercentrics|onetrust|sourcepoint|consentmanager|iubenda|gdpr_dialog|consent_?manager", re.I)
ATT = re.compile(r"app_tracking_transparency|expo-tracking-transparency|react-native-tracking-transparency|ATTrackingManager|requestTrackingAuthorization|AppTrackingTransparency", re.I)
AUTH = re.compile(r"firebase_auth|@react-native-firebase/auth|FirebaseAuth|createUserWithEmailAndPassword|supabase_flutter|@supabase/supabase-js|supabase\.auth|amplify_auth|aws-amplify|@clerk/|auth0|appwrite|pocketbase|signUp\s*\(|registerUser|/register\b|/signup\b", re.I)
DELETE_ACCOUNT = re.compile(r"deleteUser|delete_user|deleteAccount|delete_account|deleteMe|currentUser!?\??\.delete\(|user!?\??\.delete\(|auth\.admin\.deleteUser|supprimer\s+(mon|le|votre|ton)\s+compte|delete\s+(my\s+|your\s+|the\s+)?account|account[_-]?deletion|suppression\s+(du|de\s+votre|de\s+mon)\s+compte", re.I)
THIRD_LOGIN = re.compile(r"google_sign_in|@react-native-google-signin|GoogleSignIn|flutter_facebook_auth|react-native-fbsdk|FBSDKLoginKit|LoginManager\.logIn|twitter_login|sign_in_with_twitter", re.I)
APPLE_LOGIN = re.compile(r"sign_in_with_apple|expo-apple-authentication|react-native-apple-authentication|ASAuthorizationAppleIDProvider|AppleAuthProvider", re.I)
LEGAL = re.compile(r"confidentialit|privacy|mentions[\s_-]*l[ée]gales|legal|conditions\s+g[ée]n[ée]rales|terms|cgu\b|cgv\b", re.I)
IAP = re.compile(r"in_app_purchase|react-native-iap|purchases_flutter|react-native-purchases|expo-in-app-purchases|StoreKit|SKPaymentQueue|BillingClient|com\.android\.billingclient", re.I)
RESTORE = re.compile(r"restorePurchases|restoreTransactions|restoreCompletedTransactions|AppStore\.sync|Transaction\.currentEntitlements|restaurer\s+(mes\s+|les\s+)?achats|restore\s+purchases", re.I)
INSECURE_STORE = re.compile(r"(AsyncStorage\.setItem|\.setString|\.putString|UserDefaults\.standard\.set|NSUserDefaults|localStorage\.setItem|storage\.set|Preferences\.set|\.edit\(\)\s*\.putString)\s*\(\s*(?:key\s*:\s*)?['\"`][^'\"`]*(token|password|passwd|mot_?de_?passe|jwt|secret|refresh|session)", re.I)
SECURE_STORE = re.compile(r"flutter_secure_storage|expo-secure-store|react-native-keychain|react-native-encrypted-storage|EncryptedSharedPreferences|Keychain|SecItemAdd|@capacitor-community/secure-storage|SecureStorage", re.I)
NO_SCALING = re.compile(r"allowFontScaling\s*=\s*\{?\s*false|maxFontSizeMultiplier\s*=\s*\{?\s*1(\.0)?\s*\}?|textScaleFactor\s*:\s*1(\.0)?\b|TextScaler\.noScaling|TextScaler\.linear\(\s*1(\.0)?\s*\)|adjustsFontSizeToFitWidth\s*=\s*false", re.I)
JS_BRIDGE = re.compile(r"addJavascriptInterface|originWhitelist\s*=\s*\{\s*\[\s*['\"]\*['\"]\s*\]\s*\}|setAllowUniversalAccessFromFileURLs\(\s*true|allowUniversalAccessFromFileURLs\s*=\s*\{?\s*true", re.I)
PUBLIC_SECRET = re.compile(r"(EXPO_PUBLIC|REACT_APP|VITE)_\w*(SECRET|PRIVATE|SERVICE_ROLE|PASSWORD)\w*", re.I)

ANDROID_SENSITIVE = {
    "ACCESS_BACKGROUND_LOCATION": ("localisation en arrière-plan", "haute", "déclaration spéciale dans la Play Console et écran d'information dans l'appli avant la demande"),
    "ACCESS_FINE_LOCATION": ("localisation précise", "moyenne", ""),
    "ACCESS_COARSE_LOCATION": ("localisation approximative", "info", ""),
    "READ_CONTACTS": ("contacts", "moyenne", ""),
    "RECORD_AUDIO": ("micro", "moyenne", ""),
    "CAMERA": ("caméra", "info", ""),
    "READ_SMS": ("SMS", "haute", "déclaration spéciale dans la Play Console, réservée à quelques usages"),
    "RECEIVE_SMS": ("SMS", "haute", "déclaration spéciale dans la Play Console, réservée à quelques usages"),
    "SEND_SMS": ("SMS", "haute", "déclaration spéciale dans la Play Console, réservée à quelques usages"),
    "READ_CALL_LOG": ("journal d'appels", "haute", "déclaration spéciale dans la Play Console, réservée à quelques usages"),
    "QUERY_ALL_PACKAGES": ("liste des applis installées", "haute", "déclaration spéciale dans la Play Console"),
    "MANAGE_EXTERNAL_STORAGE": ("tous les fichiers", "haute", "déclaration spéciale dans la Play Console"),
    "READ_EXTERNAL_STORAGE": ("fichiers et photos", "info", ""),
    "READ_MEDIA_IMAGES": ("photos", "info", ""),
    "READ_MEDIA_VIDEO": ("vidéos", "info", ""),
    "BODY_SENSORS": ("capteurs corporels (santé)", "haute", "donnée de santé possible : avis juridique"),
    "ACTIVITY_RECOGNITION": ("activité physique", "moyenne", ""),
    "SYSTEM_ALERT_WINDOW": ("affichage par-dessus les autres applis", "moyenne", ""),
    "REQUEST_INSTALL_PACKAGES": ("installation d'autres applis", "haute", ""),
    "AD_ID": ("identifiant publicitaire", "moyenne", "à déclarer dans la section « Sécurité des données »"),
}
# permission (Android ou iOS) -> motif des bibliothèques qui l'utilisent réellement
PERM_USERS = {
    "location": r"geolocator|\blocation\b|expo-location|react-native-geolocation|@react-native-community/geolocation|CLLocationManager|FusedLocationProvider|LocationManager|google_maps|react-native-maps|@capacitor/geolocation",
    "camera": r"camera|image_picker|expo-image-picker|vision-camera|AVCaptureDevice|CameraX|mobile_scanner|qr_code|barcode|@capacitor/camera",
    "contacts": r"contacts|CNContactStore|ContactsContract",
    "microphone": r"\brecord\b|audio|expo-av|microphone|AVAudioRecorder|MediaRecorder|speech|voice|video",
    "photos": r"image_picker|photo|gallery|PHPhotoLibrary|expo-media-library|camera_roll|file_picker|@capacitor/camera",
}
ANDROID_PERM_KIND = {"ACCESS_FINE_LOCATION": "location", "ACCESS_COARSE_LOCATION": "location", "ACCESS_BACKGROUND_LOCATION": "location",
                     "CAMERA": "camera", "READ_CONTACTS": "contacts", "RECORD_AUDIO": "microphone", "READ_MEDIA_IMAGES": "photos"}
IOS_PERM_KIND = {"NSLocationWhenInUseUsageDescription": "location", "NSLocationAlwaysAndWhenInUseUsageDescription": "location",
                 "NSLocationAlwaysUsageDescription": "location", "NSCameraUsageDescription": "camera", "NSContactsUsageDescription": "contacts",
                 "NSMicrophoneUsageDescription": "microphone", "NSPhotoLibraryUsageDescription": "photos"}
VAGUE = re.compile(r"^\s*(\$\([A-Z_]+\)|this app|the app|app|we|l'appli(cation)?)\s+(needs|requires|would like|wants|a besoin|nécessite)\b.{0,25}$|^\s*(needed|required|nécessaire|requis|access|accès)\.?\s*$|^.{0,24}$", re.I)


def walk(root):
    for dp, dns, fns in os.walk(root):
        dns[:] = [d for d in dns if d not in SKIP_DIRS and not d.startswith(".") or d in (".well-known",)]
        for f in fns:
            yield os.path.join(dp, f)


def read(path):
    try:
        if os.path.getsize(path) > MAX_BYTES:
            return ""
        return open(path, encoding="utf-8", errors="ignore").read()
    except OSError:
        return ""


def strip_comments(text, ext):
    if ext in {".dart", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".swift", ".kt", ".kts", ".java", ".m", ".mm", ".cs", ".vue"}:
        text = re.sub(r"/\*.*?\*/", lambda m: "\n" * m.group(0).count("\n"), text, flags=re.S)
        text = re.sub(r"(?<![:\"'`\w(=/\\])//[^\n]*", "", text)
    return text


def line_of(text, pos):
    return text.count("\n", 0, pos) + 1


class Report:
    def __init__(self, max_occ):
        self.items, self.max = {}, max_occ

    def add(self, key, point, sev, label, occ=None):
        it = self.items.setdefault(key, {"id": key, "point": point, "gravite": sev, "constat": label, "occurrences": [], "total": 0})
        it["total"] += 1
        if occ and len(it["occurrences"]) < self.max:
            it["occurrences"].append(occ)


def detect_frameworks(root, files):
    names = {os.path.basename(f) for f in files}
    fw = []
    pkg = read(os.path.join(root, "package.json"))
    pub = read(os.path.join(root, "pubspec.yaml"))
    if pub and re.search(r"^\s*flutter\s*:", pub, re.M):
        fw.append("Flutter")
    if re.search(r'"react-native"\s*:', pkg):
        fw.append("React Native")
    if re.search(r'"expo"\s*:', pkg):
        fw.append("Expo")
    if "capacitor.config.json" in names or "capacitor.config.ts" in names:
        fw.append("Capacitor / Ionic")
    if any(os.path.basename(f) == "config.xml" and "cordova" in read(f).lower()[:3000] for f in files if f.endswith("config.xml")):
        fw.append("Cordova")
    if any(f.endswith(".csproj") and "Microsoft.Maui" in read(f) for f in files):
        fw.append(".NET MAUI")
    if any(os.path.basename(f) in ("build.gradle.kts", "build.gradle") and re.search(r"kotlin\(\s*\"multiplatform\"\s*\)|kotlin-multiplatform", read(f)) for f in files):
        fw.append("Kotlin Multiplatform")
    has_ios = any(".xcodeproj" in f or f.endswith("Info.plist") for f in files) or "Package.swift" in names
    has_android = any(os.path.basename(f) == "AndroidManifest.xml" for f in files)
    if not fw and has_ios:
        fw.append("iOS natif (Swift / Objective-C)")
    if not fw and has_android:
        fw.append("Android natif (Kotlin / Java)")
    return fw, has_ios or "Expo" in fw, has_android or "Expo" in fw


def audit(root, max_occ):
    files = list(walk(root))
    rel = lambda p: os.path.relpath(p, root).replace(os.sep, "/")
    fw, has_ios, has_android = detect_frameworks(root, files)
    if not fw:
        return {"root": os.path.abspath(root), "frameworks": [], "message": "Aucune appli mobile détectée (pas de pubspec.yaml Flutter, react-native, Expo, projet Xcode ou AndroidManifest.xml)."}
    R = Report(max_occ)

    deps = "\n".join(read(f) for f in files if os.path.basename(f) in DEP_FILES or f.endswith((".csproj", "Podfile.lock")))
    code_files = [f for f in files if os.path.splitext(f)[1].lower() in CODE_EXT]
    code = {}
    for f in code_files:
        code[rel(f)] = strip_comments(read(f), os.path.splitext(f)[1].lower())
    strings = "\n".join(read(f) for f in files if os.path.splitext(f)[1].lower() in STRING_EXT
                        or (f.endswith(".json") and re.search(r"(l10n|i18n|locales?|lang|translations?)/", rel(f)))
                        or f.endswith("strings.xml"))
    all_code = "\n".join(code.values())
    hay = deps + "\n" + all_code

    # --- SDK ---
    sdks = []
    for name, pat, use, consent, tracking in SDKS:
        if re.search(pat, hay, re.I):
            sdks.append({"sdk": name, "usage": use, "consentement": consent, "suivi_publicitaire": tracking})
    has_cmp = bool(CMP.search(hay))
    has_att = bool(ATT.search(hay))
    need_consent = [s for s in sdks if s["consentement"]]
    tracking = [s for s in sdks if s["suivi_publicitaire"]]

    # --- iOS : Info.plist, manifeste de confidentialité ---
    plists = [f for f in files if os.path.basename(f) == "Info.plist" and not re.search(r"/(Pods|Tests?|UITests|.*Extension)/", rel(f) + "/")]
    ios_keys, ats_open, fb_ios_off = {}, False, False
    for p in plists:
        try:
            with open(p, "rb") as fh:
                data = plistlib.load(fh)
        except Exception:
            continue
        for k, v in data.items():
            if k.startswith("NS") and k.endswith("UsageDescription"):
                ios_keys[k] = (str(v), rel(p))
        ats = data.get("NSAppTransportSecurity") or {}
        if isinstance(ats, dict) and ats.get("NSAllowsArbitraryLoads") is True:
            ats_open = rel(p)
        if data.get("FIREBASE_ANALYTICS_COLLECTION_ENABLED") is False or data.get("FIREBASE_ANALYTICS_COLLECTION_DEACTIVATED") is True:
            fb_ios_off = True
    expo = {}
    for f in files:
        if os.path.basename(f) == "app.json" and rel(f).count("/") == 0:
            try:
                expo = json.loads(read(f)).get("expo", {}) or {}
            except ValueError:
                expo = {}
    for k, v in ((expo.get("ios") or {}).get("infoPlist") or {}).items():
        if k.startswith("NS") and k.endswith("UsageDescription"):
            ios_keys[k] = (str(v), "app.json")
    for k, (v, where) in ios_keys.items():
        if VAGUE.search(v.strip()):
            R.add("ios-vague", "M3", "moyenne", "Texte de demande d'autorisation iOS trop vague ou trop court : dire précisément à quoi sert l'accès (Apple refuse souvent les textes vagues)",
                  {"fichier": where, "ligne": 0, "extrait": f"{k} = « {v[:80]} »"})
        kind = IOS_PERM_KIND.get(k)
        if kind and not re.search(PERM_USERS[kind], hay, re.I):
            R.add("perm-unused", "M3", "moyenne", "Autorisation déclarée sans bibliothèque qui semble l'utiliser : la retirer si elle ne sert pas (moins de données, moins de refus)",
                  {"fichier": where, "ligne": 0, "extrait": k})
    french = sum(bool(re.search(r"\b(vous|votre|nous|pour|afin|vos)\b", v, re.I)) for v, _ in ios_keys.values())
    if ios_keys and french < len(ios_keys) and not re.search(r"fr\.lproj|\"fr\"\s*:", "\n".join(rel(f) for f in files) + json.dumps(expo.get("locales") or {})):
        R.add("ios-fr", "M3", "info", "Textes de demande d'autorisation iOS sans traduction française (fr.lproj/InfoPlist.strings) : les afficher en français pour un public français", {"fichier": "Info.plist", "ligne": 0, "extrait": f"{len(ios_keys)} texte(s)"})
    if ats_open:
        R.add("ats", "M6", "moyenne", "iOS : NSAllowsArbitraryLoads = true, le trafic non chiffré (http://) est autorisé partout. Limiter aux domaines nécessaires (NSExceptionDomains)", {"fichier": ats_open, "ligne": 0, "extrait": "NSAllowsArbitraryLoads"})
    privacy_manifests = [rel(f) for f in files if f.endswith("PrivacyInfo.xcprivacy")]
    if has_ios:
        if "Expo" in fw and not any(".xcodeproj" in f for f in files):
            if not (expo.get("ios") or {}).get("privacyManifests"):
                R.add("privacy-manifest", "M1", "info", "Expo : pas de « ios.privacyManifests » dans app.json. Vérifier que le manifeste de confidentialité généré déclare les raisons des API sensibles utilisées (Apple l'exige pour publier)", None)
        elif not privacy_manifests:
            R.add("privacy-manifest", "M1", "moyenne", "Pas de manifeste de confidentialité Apple (PrivacyInfo.xcprivacy) dans le projet iOS : Apple exige d'y déclarer les raisons d'utilisation de certaines API pour publier une appli ou une mise à jour", None)
    if tracking and has_ios:
        if not has_att:
            R.add("att", "M2", "haute", f"SDK de suivi publicitaire ({', '.join(s['sdk'] for s in tracking)}) sans demande d'autorisation App Tracking Transparency : Apple exige cette autorisation avant tout suivi entre applis et sites d'autres entreprises", None)
        if "NSUserTrackingUsageDescription" not in ios_keys and has_att:
            R.add("att-text", "M2", "haute", "App Tracking Transparency utilisé sans texte NSUserTrackingUsageDescription (l'appli plante ou est refusée)", None)

    # --- Android : manifeste, niveau d'API ---
    manifests = [f for f in files if os.path.basename(f) == "AndroidManifest.xml"]
    perms, fb_android_off = {}, False
    for m in manifests:
        txt = read(m)
        for pm in re.finditer(r"<uses-permission(?:-sdk-23)?\b[^>]*android:name\s*=\s*\"([^\"]+)\"", txt):
            perms.setdefault(pm.group(1).split(".")[-1], (rel(m), line_of(txt, pm.start())))
        if re.search(r"android:debuggable\s*=\s*\"true\"", txt):
            R.add("debuggable", "M6", "haute", "android:debuggable=\"true\" dans le manifeste : jamais en production (n'importe qui peut inspecter l'appli)", {"fichier": rel(m), "ligne": 0, "extrait": "android:debuggable"})
        if re.search(r"android:usesCleartextTraffic\s*=\s*\"true\"", txt):
            R.add("cleartext", "M6", "moyenne", "Android : usesCleartextTraffic=\"true\", le trafic non chiffré (http://) est autorisé", {"fichier": rel(m), "ligne": 0, "extrait": "usesCleartextTraffic"})
        if re.search(r"firebase_analytics_collection_(enabled\"\s+android:value=\"false|deactivated\"\s+android:value=\"true)", txt):
            fb_android_off = True
        if re.search(r"<application\b[^>]*android:allowBackup\s*=\s*\"true\"", txt):
            R.add("backup", "M6", "info", "android:allowBackup=\"true\" : les données de l'appli partent dans la sauvegarde Google du téléphone. Exclure les jetons et données sensibles (dataExtractionRules)", {"fichier": rel(m), "ligne": 0, "extrait": "allowBackup"})
    for f in files:
        if f.endswith(".xml") and "network_security_config" in f and re.search(r"cleartextTrafficPermitted\s*=\s*\"true\"", read(f)):
            R.add("cleartext", "M6", "moyenne", "Android : cleartextTrafficPermitted=\"true\" dans la configuration réseau", {"fichier": rel(f), "ligne": 0, "extrait": "cleartextTrafficPermitted"})
    for p in (expo.get("android") or {}).get("permissions") or []:
        perms.setdefault(str(p).split(".")[-1], ("app.json", 0))
    for name, (where, ln) in sorted(perms.items()):
        if name in ANDROID_SENSITIVE:
            label, sev, extra = ANDROID_SENSITIVE[name]
            R.add("perm-" + sev, "M3", sev, {"haute": "Permission Android très sensible", "moyenne": "Permission Android sensible : à justifier, demander au moment utile avec une explication",
                                             "info": "Permission Android à justifier"}[sev], {"fichier": where, "ligne": ln, "extrait": f"{name} ({label})" + (f" — {extra}" if extra else "")})
        kind = ANDROID_PERM_KIND.get(name)
        if kind and not re.search(PERM_USERS[kind], hay, re.I):
            R.add("perm-unused", "M3", "moyenne", "Autorisation déclarée sans bibliothèque qui semble l'utiliser : la retirer si elle ne sert pas (moins de données, moins de refus)",
                  {"fichier": where, "ligne": ln, "extrait": name})
    if "ACCESS_BACKGROUND_LOCATION" in perms and not re.search(r"arri[èe]re-plan|background location|even when the app is closed|m[êe]me (quand|lorsque) l'appli", all_code + strings, re.I):
        R.add("prominent", "M3", "haute", "Localisation en arrière-plan sans écran d'information repéré : Google Play exige un écran dans l'appli, juste avant la demande, qui explique l'usage", None)
    targets = []
    for f in files:
        if os.path.basename(f) in ("build.gradle", "build.gradle.kts") and "/app/" in "/" + rel(f):
            for t in re.finditer(r"targetSdk(?:Version)?\s*(?:=|\s)\s*(\d+|[\w.]+)", read(f)):
                targets.append((rel(f), t.group(1)))
    exp_target = ((expo.get("plugins") and json.dumps(expo.get("plugins"))) or "")
    m = re.search(r'"targetSdkVersion"\s*:\s*(\d+)', exp_target)
    if m:
        targets.append(("app.json (expo-build-properties)", m.group(1)))
    target_info = []
    for where, val in targets:
        if val.isdigit():
            n = int(val)
            target_info.append(f"{where} : {n}")
            if n < 35:
                R.add("target", "M1", "haute", "Niveau d'API Android trop ancien : en dessous de 35, l'appli n'est plus proposée aux nouveaux utilisateurs des téléphones récents ; les nouvelles applis et mises à jour doivent viser l'API 36 depuis le 31/08/2026", {"fichier": where, "ligne": 0, "extrait": f"targetSdk {n}"})
            elif n < 36:
                R.add("target", "M1", "moyenne", "Niveau d'API Android 35 : les nouvelles applis et mises à jour doivent viser l'API 36 depuis le 31/08/2026 (Google Play)", {"fichier": where, "ligne": 0, "extrait": f"targetSdk {n}"})
        else:
            target_info.append(f"{where} : {val} (fixé par le framework : vérifier sa version)")

    # React Native Firebase : firebase.json { "react-native": { "analytics_auto_collection_enabled": false } }
    fbj = read(os.path.join(root, "firebase.json"))
    if re.search(r'"analytics_auto_collection_enabled"\s*:\s*false', fbj):
        fb_ios_off = fb_android_off = True

    # --- Consentement ---
    if need_consent and not has_cmp:
        R.add("no-cmp", "M2", "haute", f"SDK qui demandent un consentement ({', '.join(s['sdk'] for s in need_consent)}) sans outil de consentement repéré : ils ne doivent rien collecter avant l'accord de l'utilisateur. L'autorisation Apple (ATT) ne suffit pas : elle ne couvre que le suivi entre applis", None)
    if any(s["sdk"] == "Firebase Analytics" for s in sdks) and not ((fb_ios_off or not has_ios) and (fb_android_off or not has_android)):
        R.add("firebase-auto", "M2", "moyenne", "Firebase Analytics collecte dès le lancement par défaut : désactiver la collecte (FIREBASE_ANALYTICS_COLLECTION_ENABLED = false dans Info.plist, firebase_analytics_collection_enabled = false dans AndroidManifest) puis l'activer après accord (setAnalyticsCollectionEnabled(true))", None)

    # --- Compte, connexion, liens légaux, achats ---
    has_auth = bool(AUTH.search(hay))
    if has_auth and not DELETE_ACCOUNT.search(all_code + "\n" + strings):
        R.add("delete-account", "M4", "haute", "Création de compte détectée, mais aucune suppression de compte dans l'appli trouvée : Apple et Google l'exigent (Google demande aussi une page web pour la demander sans l'appli)", None)
    if has_ios and THIRD_LOGIN.search(hay) and not APPLE_LOGIN.search(hay):
        R.add("login", "M4", "moyenne", "Connexion par Google ou Facebook sans option équivalente respectueuse de la vie privée (Se connecter avec Apple ou une connexion qui limite les données au nom et à l'e-mail) : exigée par Apple", None)
    if not LEGAL.search(all_code + "\n" + strings):
        R.add("legal", "M5", "moyenne", "Aucun lien vers la politique de confidentialité ou les conditions trouvé dans l'appli : Apple et Google exigent un lien dans l'appli et sur la fiche du store", None)
    if IAP.search(hay):
        R.add("iap", "20", "info", "Achats intégrés ou abonnements : afficher prix, durée et renouvellement automatique avant l'achat, expliquer comment résilier dans le store" + ("" if RESTORE.search(all_code + strings) else " ; aucun bouton « Restaurer les achats » trouvé (demandé par Apple pour les achats restaurables)"), None)

    # --- Code : stockage, texte, accessibilité, WebView, secrets ---
    for f, txt in code.items():
        for mm in INSECURE_STORE.finditer(txt):
            if not SECURE_STORE.search(txt[max(0, mm.start() - 200): mm.end()]):
                R.add("insecure-store", "M6", "moyenne", "Jeton ou mot de passe enregistré en clair (AsyncStorage, SharedPreferences, UserDefaults…) : utiliser le trousseau sécurisé (flutter_secure_storage, expo-secure-store, react-native-keychain, Keychain, EncryptedSharedPreferences)",
                      {"fichier": f, "ligne": line_of(txt, mm.start()), "extrait": txt[mm.start(): mm.end() + 30].split("\n")[0][:140]})
        for mm in NO_SCALING.finditer(txt):
            R.add("no-scaling", "M7", "moyenne", "Taille du texte bloquée : l'appli ignore le réglage « grande police » du téléphone (gênant pour les personnes malvoyantes)",
                  {"fichier": f, "ligne": line_of(txt, mm.start()), "extrait": mm.group(0)[:100]})
        for mm in JS_BRIDGE.finditer(txt):
            R.add("webview", "M6", "info", "WebView qui ouvre un pont vers le code natif ou accepte toutes les origines : n'y charger que des pages de confiance",
                  {"fichier": f, "ligne": line_of(txt, mm.start()), "extrait": mm.group(0)[:100]})
        for mm in PUBLIC_SECRET.finditer(txt):
            R.add("public-secret", "M6", "haute", "Variable « publique » qui ressemble à un secret : tout ce qui est dans l'appli peut être extrait par n'importe qui",
                  {"fichier": f, "ligne": line_of(txt, mm.start()), "extrait": mm.group(0)})
        if f.endswith(".dart"):
            for mm in re.finditer(r"\bIconButton\s*\(", txt):
                window = txt[mm.end(): mm.end() + 500]
                if not re.search(r"tooltip\s*:|semanticLabel\s*:", window.split("IconButton(")[0]):
                    R.add("icon-noname", "M7", "moyenne", "Bouton icône sans nom (tooltip) : le lecteur d'écran annonce « bouton » sans dire lequel",
                          {"fichier": f, "ligne": line_of(txt, mm.start()), "extrait": "IconButton("})
            for mm in re.finditer(r"\bImage\.(asset|network|file|memory)\s*\(", txt):
                window = txt[mm.end(): mm.end() + 400]
                if not re.search(r"semanticLabel\s*:|excludeFromSemantics\s*:", window):
                    R.add("img-noname", "M7", "info", "Image sans description (semanticLabel) ni marquage décoratif (excludeFromSemantics: true)",
                          {"fichier": f, "ligne": line_of(txt, mm.start()), "extrait": mm.group(0)})
        if f.endswith((".tsx", ".jsx", ".js")):
            for mm in re.finditer(r"<(Pressable|TouchableOpacity|TouchableHighlight|TouchableWithoutFeedback)\b([^>]*)>", txt):
                if re.search(r"accessibilityLabel|aria-label|accessible\s*=\s*\{?\s*false", mm.group(2)):
                    continue
                inner = txt[mm.end(): mm.end() + 400]
                close = inner.find("</" + mm.group(1))
                inner = inner[: close if close >= 0 else 400]
                if not re.search(r"<Text\b|\btitle\s*=", inner):
                    R.add("touch-noname", "M7", "moyenne", "Zone tactile sans texte ni accessibilityLabel : le lecteur d'écran ne sait pas la nommer",
                          {"fichier": f, "ligne": line_of(txt, mm.start()), "extrait": mm.group(0)[:100]})
    pub = read(os.path.join(root, "pubspec.yaml"))
    am = re.search(r"^\s*assets\s*:\s*\n((?:\s+-.*\n?)+)", pub, re.M)
    if am and re.search(r"-\s*['\"]?\.?env\b|\.env['\"]?\s*$", am.group(1), re.M):
        R.add("env-asset", "M6", "haute", "Fichier .env déclaré comme ressource de l'appli (flutter_dotenv) : il est livré dans l'appli et n'importe qui peut le lire. N'y mettre aucun secret (les secrets restent sur un serveur)", {"fichier": "pubspec.yaml", "ligne": 0, "extrait": "assets: .env"})
    if re.search(r"react-native-config|react-native-dotenv|expo-constants", deps) and re.search(r"(SECRET|PRIVATE_KEY|SERVICE_ROLE)", "\n".join(read(f) for f in files if os.path.basename(f).startswith(".env") and not f.endswith((".example", ".sample")))):
        R.add("env-rn", "M6", "haute", "Variables .env injectées dans l'appli (react-native-config, dotenv, expo-constants) contenant un secret : elles sont lisibles dans l'appli publiée", None)

    return {
        "root": os.path.abspath(root),
        "frameworks": fw,
        "plateformes": [p for p, ok in (("iOS", has_ios), ("Android", has_android)) if ok],
        "sdk": sdks,
        "outil_consentement": has_cmp,
        "app_tracking_transparency": has_att,
        "comptes": has_auth,
        "permissions_android": sorted(perms),
        "autorisations_ios": {k: v for k, (v, _) in sorted(ios_keys.items())},
        "manifestes_confidentialite_apple": privacy_manifests,
        "niveau_api_android": target_info,
        "constats": list(R.items.values()),
    }


SEV_ICON = {"haute": "🔴", "moyenne": "🟠", "info": "🔵"}
SEV_ORDER = {"haute": 0, "moyenne": 1, "info": 2}


def render(r):
    out = [f"# Analyse de l'appli mobile — {r['root']}", ""]
    if not r["frameworks"]:
        return "\n".join(out + [r["message"]])
    out.append(f"Technologie : {', '.join(r['frameworks'])} · plateformes : {', '.join(r['plateformes']) or '?'}")
    out.append(f"Comptes utilisateurs : {'oui' if r['comptes'] else 'non repéré'} · outil de consentement : {'oui' if r['outil_consentement'] else 'non repéré'} · App Tracking Transparency : {'oui' if r['app_tracking_transparency'] else 'non'}")
    if r["niveau_api_android"]:
        out.append(f"Niveau d'API Android visé : {' ; '.join(r['niveau_api_android'])}")
    out += ["", "## SDK et services repérés", ""]
    if r["sdk"]:
        out += ["| SDK | Usage | Consentement nécessaire | Suivi publicitaire (ATT) |", "|---|---|---|---|"]
        for s in r["sdk"]:
            out.append(f"| {s['sdk']} | {s['usage']} | {'oui' if s['consentement'] else 'non en principe (sans donnée de suivi)'} | {'oui' if s['suivi_publicitaire'] else 'non'} |")
    else:
        out.append("Aucun SDK connu repéré.")
    if r["permissions_android"]:
        out += ["", "Permissions Android déclarées (dans les sources) : " + ", ".join(r["permissions_android"])]
    if r["autorisations_ios"]:
        out += ["", "Autorisations iOS et leur texte :"]
        out += [f"- {k} : « {v[:100]} »" for k, v in r["autorisations_ios"].items()]
    out += ["", "## Constats", ""]
    items = sorted(r["constats"], key=lambda x: (SEV_ORDER[x["gravite"]], x["point"]))
    if not items:
        out.append("Aucun constat.")
    for it in items:
        n = it["total"]
        out.append(f"### {SEV_ICON[it['gravite']]} [{it['point']}] {it['constat']}" + (f" ({n})" if n > 1 else ""))
        for o in it["occurrences"]:
            out.append(f"- `{o['fichier']}{':' + str(o['ligne']) if o.get('ligne') else ''}` — {o['extrait']}")
        if n > len(it["occurrences"]) and it["occurrences"]:
            out.append(f"- … {n - len(it['occurrences'])} autre(s)")
        out.append("")
    out += ["## À vérifier sur l'appli lancée (simulateur iOS, émulateur Android)", "",
            "- Premier lancement, sans rien accepter : aucune requête vers un SDK de suivi (proxy comme mitmproxy ou Proxyman, ou journaux réseau) ; écran de consentement avec « Refuser » aussi simple qu'« Accepter ».",
            "- Chaque demande d'autorisation arrive au moment où on en a besoin, avec une explication avant.",
            "- Paramètres de l'appli : liens vers la politique de confidentialité, les conditions, les mentions légales ; suppression du compte en quelques étapes.",
            "- VoiceOver (iOS) et TalkBack (Android) : chaque bouton est annoncé ; grande taille de texte : rien n'est coupé.",
            "- Fiche du store : « App Privacy » (Apple) et « Sécurité des données » (Google) cohérentes avec les SDK ci-dessus ; statut de professionnel (trader) déclaré.",
            "",
            "_Les permissions Android finales viennent de la fusion des manifestes à la compilation (les bibliothèques en ajoutent) : vérifier aussi le fichier compilé (Play Console, ou `aapt dump permissions`)._",
            "_Détection par motifs : chaque constat est à confirmer en lisant le code._"]
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("root")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--max", type=int, default=8, help="Occurrences affichées par constat (défaut 8)")
    a = ap.parse_args()
    if not os.path.isdir(a.root):
        print(f"Dossier introuvable : {a.root}", file=sys.stderr)
        sys.exit(1)
    r = audit(a.root, a.max)
    print(json.dumps(r, ensure_ascii=False, indent=2) if a.json else render(r))


if __name__ == "__main__":
    main()
