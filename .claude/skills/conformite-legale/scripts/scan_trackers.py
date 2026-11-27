#!/usr/bin/env python3
"""Scanne un projet web ou mobile pour repérer ce qui compte en conformité légale.

Détecte : traceurs et services tiers (avec besoin de consentement), outils de
gestion du consentement, pages légales existantes, formulaires, cases
pré-cochées, fonctionnalités IA, paiement, liens obsolètes (plateforme RLL/ODR).

Usage :
    python3 scan_trackers.py <dossier> [--json]

Bibliothèque standard uniquement. Le résultat est un point de départ : vérifier
à la main et, si possible, dans un navigateur (cookies déposés avant consentement).
"""

import argparse
import json
import os
import re
import sys
from collections import defaultdict

SKIP_DIRS = {
    "node_modules", ".git", ".next", ".nuxt", ".svelte-kit", ".output", "dist",
    "build", "out", "coverage", ".cache", ".turbo", ".vercel", ".netlify",
    "vendor", "Pods", ".gradle", "DerivedData", "__pycache__", ".venv", "venv",
    ".idea", ".vscode", "public/build", "storybook-static", "target", "bin", "obj", "_build", "deps",
    "wp-admin", "wp-includes", "storage", "tmp", "bower_components",
}
TEXT_EXT = {
    ".html", ".htm", ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue",
    ".svelte", ".astro", ".php", ".twig", ".liquid", ".erb", ".hbs", ".njk",
    ".ejs", ".pug", ".md", ".mdx", ".json", ".py", ".rb", ".go", ".css",
    ".scss", ".swift", ".kt", ".java", ".dart", ".xml", ".plist", ".gradle",
    ".kts", ".yml", ".yaml", ".toml", ".env.example", ".txt", ".csproj",
    ".cshtml", ".razor", ".cs", ".vb", ".aspx", ".ascx", ".master", ".jsp", ".jspx", ".tag", ".ftl", ".vm",
    ".jinja", ".jinja2", ".j2", ".tpl", ".mustache", ".handlebars", ".eex", ".heex", ".leex", ".ex", ".exs",
    ".slim", ".haml", ".latte", ".phtml", ".gohtml", ".tmpl", ".rs", ".scala", ".marko", ".m", ".mm",
    ".storyboard", ".xib", ".kts", ".gradle", ".config", ".properties", ".ini", ".cfm", ".pl", ".lua",
}
SPECIAL_FILES = {"Podfile", "Gemfile", "pubspec.yaml", "composer.json", "package.json", "Pipfile", "go.mod",
                 "Cargo.toml", "pom.xml", "build.gradle", "packages.config", "mix.exs", "Dockerfile"}
MAX_BYTES = 2_000_000

# (identifiant, libellé, catégorie, consentement, regex)
# consentement : "oui", "non", "selon config", "à évaluer"
SERVICES = [
    ("ga", "Google Analytics / gtag", "Mesure d'audience", "oui",
     r"googletagmanager\.com/gtag|google-analytics\.com|gtag\(\s*['\"]config|\bG-[A-Z0-9]{6,}\b|@next/third-parties/google|react-ga4?|vue-gtag"
     r"|google-site-kit|monsterinsights|ga-google-analytics|analytify|django-google-analytics|laravel-analytics"),
    ("gtm", "Google Tag Manager", "Gestionnaire de balises", "selon config",
     r"googletagmanager\.com/gtm\.js|\bGTM-[A-Z0-9]{4,}\b|react-gtm-module"),
    ("gads", "Google Ads / DoubleClick", "Publicité", "oui",
     r"googleadservices\.com|doubleclick\.net|googlesyndication\.com|\bAW-\d{6,}"),
    ("meta", "Meta (Facebook) Pixel / SDK", "Publicité", "oui",
     r"connect\.facebook\.net|fbq\(|facebook-pixel|react-facebook-pixel|FBSDK|com\.facebook\.android|pixelyoursite|facebook-for-woocommerce"),
    ("tiktok", "TikTok Pixel", "Publicité", "oui", r"analytics\.tiktok\.com|ttq\.load|ttq\.track"),
    ("linkedin", "LinkedIn Insight", "Publicité", "oui", r"snap\.licdn\.com|_linkedin_partner_id"),
    ("pinterest", "Pinterest Tag", "Publicité", "oui", r"s\.pinimg\.com/ct|pintrk\("),
    ("snap", "Snap Pixel", "Publicité", "oui", r"sc-static\.net/scevent|snaptr\("),
    ("twitter", "X / Twitter Pixel ou widgets", "Publicité / réseaux sociaux", "oui",
     r"static\.ads-twitter\.com|platform\.twitter\.com|twq\("),
    ("criteo", "Criteo", "Publicité", "oui", r"static\.criteo\.net|criteo"),
    ("taboola", "Taboola / Outbrain", "Publicité", "oui", r"taboola\.com|outbrain\.com"),
    ("hotjar", "Hotjar", "Analyse comportementale", "oui", r"static\.hotjar\.com|hotjar"),
    ("clarity", "Microsoft Clarity", "Analyse comportementale", "oui", r"clarity\.ms|microsoft-clarity"),
    ("fullstory", "FullStory / Mouseflow / LogRocket (replay)", "Analyse comportementale", "oui",
     r"fullstory\.com|mouseflow\.com|logrocket"),
    ("mixpanel", "Mixpanel / Amplitude / Segment / Heap / PostHog", "Analytics produit", "oui en général",
     r"mixpanel|amplitude\.com|@amplitude|cdn\.segment\.com|analytics-next|heapanalytics|posthog"),
    ("matomo", "Matomo", "Mesure d'audience", "selon config (exemption CNIL possible)",
     r"matomo\.(js|php)|piwik\.(js|php)|_paq\.push|@datapunt/matomo|vue-matomo"),
    ("plausible", "Plausible / Fathom / Simple Analytics / Umami", "Mesure d'audience", "selon config (souvent sans cookie)",
     r"plausible\.io|usefathom\.com|simpleanalyticscdn|umami"),
    ("vercel-analytics", "Vercel Analytics / Speed Insights", "Mesure d'audience", "selon config (sans cookie)",
     r"@vercel/analytics|@vercel/speed-insights"),
    ("cf-analytics", "Cloudflare Web Analytics", "Mesure d'audience", "selon config (sans cookie)",
     r"static\.cloudflareinsights\.com"),
    ("youtube", "YouTube intégré", "Contenu intégré", "oui (ou chargement au clic)",
     r"youtube\.com/embed|youtube-nocookie\.com|youtu\.be|react-youtube|lite-youtube"),
    ("vimeo", "Vimeo intégré", "Contenu intégré", "oui (ou chargement au clic)", r"player\.vimeo\.com"),
    ("gmaps", "Google Maps intégré", "Contenu intégré", "oui (ou chargement au clic)",
     r"maps\.googleapis\.com|google\.com/maps/embed|@react-google-maps|@googlemaps"),
    ("instagram", "Instagram / Facebook embeds", "Contenu intégré", "oui", r"instagram\.com/embed|platform\.instagram\.com"),
    ("gfonts", "Google Fonts (serveurs Google)", "Polices tierces", "transfert d'IP : héberger en local",
     r"fonts\.googleapis\.com|fonts\.gstatic\.com"),
    ("recaptcha", "Google reCAPTCHA", "Anti-spam", "à évaluer (préférer une alternative)",
     r"google\.com/recaptcha|recaptcha/api\.js|react-google-recaptcha|grecaptcha"),
    ("hcaptcha", "hCaptcha / Turnstile / Friendly Captcha", "Anti-spam", "non en général",
     r"hcaptcha\.com|challenges\.cloudflare\.com/turnstile|friendlycaptcha"),
    ("intercom", "Chat / support (Intercom, Crisp, HubSpot, Zendesk, Tawk, Tidio)", "Support", "oui en général",
     r"widget\.intercom\.io|intercom|client\.crisp\.chat|js\.hs-scripts\.com|hubspot|zdassets\.com|embed\.tawk\.to|tidio"),
    ("stripe", "Stripe", "Paiement", "non (fonction de paiement)",
     r"js\.stripe\.com|@stripe/|(?:from|require\(|import\(?)\s*['\"]stripe['\"]|['\"]stripe['\"]\s*:|STRIPE_(?:SECRET|PUBLISHABLE)"),
    ("paypal", "PayPal", "Paiement", "non (fonction de paiement)", r"paypal\.com/sdk|@paypal/"),
    ("lemonsqueezy", "Paddle / Lemon Squeezy / Mollie / PayPlug", "Paiement", "non (fonction de paiement)",
     r"paddle\.com|lemonsqueezy|mollie|payplug"),
    ("sentry", "Sentry", "Suivi d'erreurs", "intérêt légitime possible ; replay = consentement",
     r"@sentry/|sentry\.io|browser\.sentry-cdn"),
    ("firebase", "Firebase Analytics / Google Analytics for Firebase", "Mesure d'audience (mobile)", "oui",
     r"firebase/analytics|firebase-analytics|FirebaseAnalytics|getAnalytics\("),
    ("mobile-attrib", "AppsFlyer / Adjust / Branch / AdMob / OneSignal", "Publicité / attribution (mobile)", "oui",
     r"appsflyer|com\.adjust\.sdk|adjust-sdk|react-native-adjust|branch\.io|react-native-branch|admob|google-mobile-ads|onesignal"),
    ("mailchimp", "Mailchimp / Brevo / Mailerlite / ConvertKit (newsletter)", "Prospection e-mail", "consentement à la collecte",
     r"mailchimp|list-manage\.com|sendinblue|brevo|mailerlite|convertkit|kit\.com"),
    ("shopify-analytics", "Shopify (statistiques et pixels clients)", "Mesure d'audience / publicité", "selon config (API Customer Privacy)",
     r"Shopify\.analytics|cdn\.shopify\.com/s/trekkie|monorail-edge\.shopifysvc|web-pixels-manager|customerPrivacy"),
    ("woo-attribution", "WooCommerce (attribution des commandes, sourcebuster)", "Mesure d'audience", "oui en général",
     r"wc-order-attribution|sourcebuster|sbjs_"),
    ("wix-squarespace", "Wix / Squarespace / Webflow (statistiques intégrées)", "Mesure d'audience", "selon config de la plateforme",
     r"static\.parastorage\.com|frog\.wix\.com|static1\.squarespace\.com|assets\.squarespace\.com|webflow\.com/.*\.js"),
    ("ai", "Fournisseur d'IA (OpenAI, Anthropic, Mistral, Google, Vercel AI SDK…)", "Intelligence artificielle", "AI Act art. 50 + RGPD",
     # Vraies intégrations seulement (import, dépendance, API) — pas un nom cité dans un texte
     r"@anthropic-ai/|anthropic\.com/v1|api\.openai\.com|api\.mistral\.ai|@google/generative-ai|@google/genai|@ai-sdk/|@langchain/"
     r"|(?:from|require\(|import\(?)\s*['\"](?:openai|mistralai|@mistralai/[\w-]+|ai|langchain)['\"]"
     r"|['\"](?:openai|mistralai|langchain)['\"]\s*:|(?:OPENAI|ANTHROPIC|MISTRAL)_API_KEY"),
]

CMP = [
    ("Axeptio", r"axept\.io|axeptio"),
    ("Didomi", r"didomi"),
    ("tarteaucitron", r"tarteaucitron"),
    ("Cookiebot", r"cookiebot"),
    ("OneTrust", r"onetrust|optanon"),
    ("Klaro", r"\bklaro\b"),
    ("cookieconsent (orestbida / osano)", r"vanilla-cookieconsent|cookieconsent|orestbida"),
    ("Iubenda", r"iubenda"),
    ("Usercentrics", r"usercentrics"),
    ("Sirdata / CookieYes / Complianz / Termly", r"sirdata|cookieyes|complianz|termly"),
    ("Extension WordPress (Cookie Notice, CookieYes, GDPR Cookie Compliance, Real Cookie Banner, Borlabs, Moove)",
     r"cookie-notice|cookie-law-info|gdpr-cookie-compliance|real-cookie-banner|borlabs-cookie|moove_gdpr|gdpr-cookie-consent"),
    ("Paquet de consentement (django-cookie-consent, laravel-cookie-consent, cookie_consent Rails…)",
     r"django[-_]cookie[-_]consent|laravel-cookie-consent|cookie[-_]consent[-_]?(rails|gem)|ConsentManager"),
    ("Google Consent Mode", r"gtag\(\s*['\"]consent['\"]|consent_mode|ad_storage|analytics_storage"),
    ("App Tracking Transparency (iOS)", r"ATTrackingManager|requestTrackingAuthorization|NSUserTrackingUsageDescription"),
]

LEGAL_PAGES = [
    ("Mentions légales", r"mentions[-_ ]?l[ée]gales|legal[-_ ]?notice|imprint|impressum"),
    ("Politique de confidentialité", r"confidentialit[ée]|privacy[-_ ]?policy|donn[ée]es[-_ ]?personnelles|/privacy\b"),
    ("Politique cookies / gestion des cookies", r"politique[-_ ]?cookies|cookie[-_ ]?policy|g[ée]rer[-_ ]?(mes[-_ ]?)?cookies|manage[-_ ]?cookies|cookie[-_ ]?settings"),
    ("CGV", r"\bcgv\b|conditions[-_ ]?g[ée]n[ée]rales[-_ ]?de[-_ ]?vente|terms[-_ ]?of[-_ ]?sale"),
    ("CGU", r"\bcgu\b|conditions[-_ ]?g[ée]n[ée]rales[-_ ]?d['’]?utilisation|terms[-_ ]?of[-_ ]?(use|service)"),
    ("Déclaration d'accessibilité", r"d[ée]claration[-_ ]?d['’]?accessibilit[ée]|accessibility[-_ ]?statement|/accessibilit[ée]"),
    ("Résiliation en ligne", r"r[ée]silier[-_ ]?(votre|mon|le)[-_ ]?(contrat|abonnement)|cancel[-_ ]?subscription"),
    ("Fonction de rétractation", r"renoncer[-_ ]?au[-_ ]?contrat|se[-_ ]?r[ée]tracter|r[ée]tractation|withdraw(al)?[-_ ]?(from|button|function)"),
    ("Médiateur de la consommation", r"m[ée]diat(eur|ion)[-_ ]?de[-_ ]?la[-_ ]?consommation|m[ée]diateur"),
    ("Suppression de compte", r"supprimer[-_ ]?(mon|votre|le)[-_ ]?compte|delete[-_ ]?(my[-_ ]?|your[-_ ]?)?account"),
    ("Do Not Sell or Share (Californie)", r"do[-_ ]?not[-_ ]?sell"),
]

CHECKS = [
    ("form", "Formulaire", r"<form\b|useForm\(|onSubmit=|@submit|type=['\"]email['\"]|input type=email"),
    ("prechecked", "Case pré-cochée (à vérifier : interdit pour un consentement)",
     r"type=['\"]checkbox['\"][^>]*\b(?:defaultChecked|checked)(?:\s*=\s*(?:\{\s*true\s*\}|['\"](?:checked|true)?['\"]))?(?=[\s/>])"),
    ("odr", "Lien vers la plateforme européenne RLL/ODR (supprimée le 20/07/2025, à retirer)",
     r"ec\.europa\.eu/consumers/odr|plateforme (européenne )?(de )?r[èe]glement en ligne des litiges|\bODR platform"),
    ("iframe", "iframe (contenu intégré à vérifier)", r"<iframe\b"),
    ("localstorage", "localStorage / sessionStorage (traceur si non nécessaire)", r"localStorage\.setItem|sessionStorage\.setItem"),
    ("document-cookie", "Écriture directe de cookie", r"document\.cookie\s*="),
    ("pay-button", "Bouton de paiement : libellé à vérifier (« Commander avec obligation de paiement »)",
     # Libellés de bouton seulement (texte affiché ou chaîne exacte), pas un nom de fichier comme checkout.spec.ts
     r"commander avec obligation de paiement|payer maintenant|valider (?:la |ma )?commande|place order"
     r"|>\s*(?:proceed to )?checkout\s*<|['\"`](?:proceed to )?checkout['\"`]\s*[,)}\]]"),
    ("lang", "Attribut lang présent sur <html> (vérifier qu il vaut fr si le site vise la France)", r"<html[^>]*\blang="),
]



# --- Commentaires : remplacés par des espaces (numéros de ligne conservés) pour éviter les faux positifs
_C_LIKE = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".css", ".scss", ".sass", ".less", ".vue", ".svelte",
           ".astro", ".java", ".kt", ".kts", ".gradle", ".swift", ".dart", ".go", ".php", ".phtml", ".cs", ".c", ".cpp",
           ".rs", ".scala", ".m", ".mm"}
_HTML_LIKE = {".html", ".htm", ".vue", ".svelte", ".astro", ".php", ".phtml", ".twig", ".hbs", ".handlebars", ".ejs",
              ".njk", ".liquid", ".blade.php", ".cshtml", ".razor", ".aspx", ".ascx", ".master", ".jsp", ".jspx", ".tag",
              ".ftl", ".vm", ".jinja", ".jinja2", ".j2", ".tpl", ".mustache", ".eex", ".heex", ".leex", ".latte",
              ".gohtml", ".tmpl", ".erb", ".marko", ".xml", ".xib", ".storyboard", ".config", ".cfm"}
# Langages à commentaires « # » (seules les lignes qui commencent par # : pas de risque sur les couleurs CSS)
_HASH_LIKE = {".py", ".rb", ".ex", ".exs", ".yml", ".yaml", ".toml", ".sh", ".pl", ".properties", ".ini", ".r"}
_BLOCK = re.compile(r"/\*.*?\*/", re.S)
_LINE = re.compile(r"(?<![:\"'`\w(=/\\])//[^\n]*")
_HTML_COMMENT = re.compile(r"<!--.*?-->", re.S)
_HASH_LINE = re.compile(r"^[ \t]*#(?![!{])[^\n]*", re.M)
# Commentaires de gabarits : Twig/Jinja/Nunjucks {# #}, Blade {{-- --}}, Razor @* *@, ERB/EEx <%# %>,
# JSP/ASPX <%-- --%>, Handlebars {{!-- --}}, Smarty/Latte {* *}, FreeMarker <#-- -->, Go {{/* */}}
_TPL_COMMENT = re.compile(r"\{#.*?#\}|\{\{--.*?--\}\}|@\*.*?\*@|<%#.*?%>|<%--.*?--%>|\{\{!--.*?--\}\}|\{\{![^}]*\}\}"
                          r"|\{\*.*?\*\}|<#--.*?-->|\{\{/\*.*?\*/\}\}", re.S)
_NO_TPL_COMMENT = {".svelte", ".vue", ".astro", ".xml", ".xib", ".storyboard", ".config"}


def _blank(m):
    return re.sub(r"[^\n]", " ", m.group(0))


def strip_comments(text, ext):
    """Neutralise les commentaires sans changer les numéros de ligne."""
    if ext in _HTML_LIKE:
        text = _HTML_COMMENT.sub(_blank, text)
        if ext not in _NO_TPL_COMMENT:
            text = _TPL_COMMENT.sub(_blank, text)
    if ext in _C_LIKE:
        text = _BLOCK.sub(_blank, text)
        text = _LINE.sub(_blank, text)
    if ext in _HASH_LIKE:
        text = _HASH_LINE.sub(_blank, text)
    return text

# Rapports et documentation du dépôt : jamais des pages du site (sinon le rapport précédent
# « contient » des CGV, un médiateur… et fausse la détection des pages légales)
REPORT_FILES = {"telechargement.json", "conformite.md", "crash-test.md", "couverture.md", "textes-visibles.md", "readme.md", "changelog.md",
                "contributing.md", "license", "license.md", "security.md", "audit.md", "code_of_conduct.md"}


def iter_files(root):
    for dirpath, dirnames, filenames in os.walk(root):
        rel = os.path.relpath(dirpath, root)
        dirnames[:] = [
            d for d in dirnames
            if d not in SKIP_DIRS and (not d.startswith(".") or d == ".well-known")
        ]
        for name in filenames:
            path = os.path.join(dirpath, name)
            ext = os.path.splitext(name)[1].lower()
            if ext in TEXT_EXT or name in SPECIAL_FILES or name.startswith(".env"):
                if name.lower() in REPORT_FILES:
                    continue
                if name.endswith(".min.js") or name in {"package-lock.json", "yarn.lock", "pnpm-lock.yaml"}:
                    continue
                try:
                    if os.path.getsize(path) > MAX_BYTES:
                        continue
                except OSError:
                    continue
                yield path


PROSE_EXT = {".md", ".mdx", ".txt"}
I18N_PATH = re.compile(r"(^|/)(locales?|i18n|lang|languages|translations?|messages|dictionaries|intl|l10n|content|contenus?)/", re.I)
_QUOTED = re.compile(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"|`(?:[^`\\\n]|\\.)*`")


def cited_in_text(line, m, ext, rel):
    """Vrai si le nom du service est seulement cité dans une phrase (politique de
    confidentialité, traduction, article), et non branché dans le code."""
    hit = m.group(0)
    if re.search(r"[./(]|^\w+-\w+", hit) and not re.fullmatch(r"[\w-]+", hit):
        return False  # domaine, URL, appel de fonction, paquet : vraie intégration
    if ext in PROSE_EXT:
        return True
    # À l'intérieur d'une chaîne qui ressemble à une phrase
    for q in _QUOTED.finditer(line):
        if q.start() <= m.start() < q.end():
            inner = q.group(0)[1:-1]
            if len(inner.split()) >= 4 and not re.search(r"https?://|<script|src=", inner):
                return True
            if I18N_PATH.search(rel) and len(inner.split()) >= 2:
                return True
            return False
    # Texte JSX/HTML entre balises : >Nous n'utilisons pas Hotjar<
    before, after = line[:m.start()], line[m.end():]
    if ">" in before and "<" in after and before.rfind(">") > before.rfind("<"):
        seg = before[before.rfind(">") + 1:] + hit + after[: after.find("<")]
        if len(seg.split()) >= 3:
            return True
    return False


def scan(root):
    compiled = {
        "services": [(sid, label, cat, consent, re.compile(rx, re.I)) for sid, label, cat, consent, rx in SERVICES],
        "cmp": [(label, re.compile(rx, re.I)) for label, rx in CMP],
        "legal": [(label, re.compile(rx, re.I)) for label, rx in LEGAL_PAGES],
        "checks": [(cid, label, re.compile(rx, re.I)) for cid, label, rx in CHECKS],
    }
    hits = {k: defaultdict(list) for k in ("services", "cmp", "legal", "checks")}
    cited_only = defaultdict(list)
    files_scanned = 0

    for path in iter_files(root):
        rel = os.path.relpath(path, root)
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                content = fh.read()
            content = strip_comments(content, os.path.splitext(path)[1].lower())
        except OSError:
            continue
        files_scanned += 1
        # Les noms de fichiers comptent pour les pages légales (routes).
        haystack_path = rel.replace(os.sep, "/")
        lines = content.splitlines()

        def locate(rx):
            for i, line in enumerate(lines, 1):
                if rx.search(line):
                    return i
            return None

        ext = os.path.splitext(path)[1].lower()
        for sid, label, cat, consent, rx in compiled["services"]:
            real = cited = None
            for i, ln in enumerate(lines, 1):
                for mm in rx.finditer(ln):
                    if cited_in_text(ln, mm, ext, haystack_path):
                        cited = cited or i
                    else:
                        real = i
                        break
                if real:
                    break
            if real:
                hits["services"][sid].append(f"{haystack_path}:{real}")
            elif cited:
                cited_only[sid].append(f"{haystack_path}:{cited}")
        for label, rx in compiled["cmp"]:
            line = locate(rx)
            if line:
                hits["cmp"][label].append(f"{haystack_path}:{line}")
        for label, rx in compiled["legal"]:
            if rx.search(haystack_path):
                hits["legal"][label].append(haystack_path)
            else:
                line = locate(rx)
                if line:
                    hits["legal"][label].append(f"{haystack_path}:{line}")
        for cid, label, rx in compiled["checks"]:
            line = locate(rx)
            if line:
                hits["checks"][cid].append(f"{haystack_path}:{line}")

    meta = {sid: (label, cat, consent) for sid, label, cat, consent, _ in SERVICES}
    check_meta = {cid: label for cid, label, _ in CHECKS}

    result = {
        "root": os.path.abspath(root),
        "files_scanned": files_scanned,
        "services": [
            {"id": sid, "service": meta[sid][0], "categorie": meta[sid][1],
             "consentement": meta[sid][2], "occurrences": locs[:10], "total": len(locs)}
            for sid, locs in hits["services"].items()
        ],
        "cites_dans_un_texte": [
            {"id": sid, "service": meta[sid][0], "occurrences": locs[:5], "total": len(locs)}
            for sid, locs in cited_only.items() if sid not in hits["services"]
        ],
        "outils_consentement": [
            {"outil": label, "occurrences": locs[:5], "total": len(locs)}
            for label, locs in hits["cmp"].items()
        ],
        "pages_legales_trouvees": [
            {"page": label, "occurrences": locs[:5], "total": len(locs)}
            for label, locs in hits["legal"].items()
        ],
        "pages_legales_absentes": [label for label, _ in LEGAL_PAGES if label not in hits["legal"]],
        "points_a_verifier": [
            {"id": cid, "point": check_meta[cid], "occurrences": locs[:10], "total": len(locs)}
            for cid, locs in hits["checks"].items()
        ],
    }
    return result


def render_markdown(r):
    out = [f"# Scan de conformité — {r['root']}", "", f"Fichiers analysés : {r['files_scanned']}", ""]

    needs_consent = [s for s in r["services"] if s["consentement"].startswith("oui")]
    has_cmp = bool(r["outils_consentement"])
    out.append("## Synthèse")
    out.append(f"- Services tiers détectés : {len(r['services'])}, dont {len(needs_consent)} nécessitant a priori un consentement")
    out.append(f"- Outil de consentement détecté : {'oui (' + ', '.join(c['outil'] for c in r['outils_consentement']) + ')' if has_cmp else 'NON'}")
    if needs_consent and not has_cmp:
        out.append("- ⚠️ Des traceurs soumis au consentement sont présents sans outil de consentement détecté : point bloquant probable.")
    if any(c["id"] == "odr" for c in r["points_a_verifier"]):
        out.append("- ⚠️ Lien vers la plateforme RLL/ODR détecté : à retirer (plateforme fermée le 20/07/2025).")
    out.append("")

    out.append("## Services tiers")
    if r["services"]:
        out.append("| Service | Catégorie | Consentement | Où (extrait) |")
        out.append("|---|---|---|---|")
        for s in sorted(r["services"], key=lambda x: x["categorie"]):
            out.append(f"| {s['service']} | {s['categorie']} | {s['consentement']} | {', '.join(s['occurrences'][:3])}{' …' if s['total'] > 3 else ''} |")
    else:
        out.append("Aucun service tiers connu détecté.")
    out.append("")

    if r.get("cites_dans_un_texte"):
        out.append("## Services seulement cités dans un texte (non comptés)")
        out.append("Le nom apparaît dans une phrase (politique, traduction, article), sans intégration repérée. À confirmer en lisant la ligne.")
        for c in r["cites_dans_un_texte"]:
            out.append(f"- {c['service']} : {', '.join(c['occurrences'][:3])}")
        out.append("")

    out.append("## Outils de consentement")
    if r["outils_consentement"]:
        for c in r["outils_consentement"]:
            out.append(f"- {c['outil']} : {', '.join(c['occurrences'][:3])}")
    else:
        out.append("Aucun détecté.")
    out.append("")

    out.append("## Pages et fonctions légales")
    for p in r["pages_legales_trouvees"]:
        out.append(f"- ✅ {p['page']} : {', '.join(p['occurrences'][:2])}")
    for label in r["pages_legales_absentes"]:
        out.append(f"- ❓ {label} : non trouvé (peut être inutile selon le projet)")
    out.append("")

    out.append("## Points à vérifier à la main")
    if r["points_a_verifier"]:
        for c in r["points_a_verifier"]:
            out.append(f"- {c['point']} ({c['total']}) : {', '.join(c['occurrences'][:4])}{' …' if c['total'] > 4 else ''}")
    else:
        out.append("Aucun.")
    out.append("")
    out.append("_Détection par motifs : faux positifs et oublis possibles. Vérifier dans le navigateur quels cookies et requêtes partent avant consentement._")
    return "\n".join(out)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("root", help="Dossier du projet à analyser")
    parser.add_argument("--json", action="store_true", help="Sortie JSON")
    args = parser.parse_args()

    if not os.path.isdir(args.root):
        print(f"Dossier introuvable : {args.root}", file=sys.stderr)
        sys.exit(1)

    result = scan(args.root)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(render_markdown(result))


if __name__ == "__main__":
    main()
