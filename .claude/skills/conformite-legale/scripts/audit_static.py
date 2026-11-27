#!/usr/bin/env python3
"""Analyse statique d'un projet : accessibilité, sécurité (OWASP), pratiques
trompeuses, données collectées, e-mails marketing et licences.

Complète scan_trackers.py (traceurs, bandeau, pages légales). Chaque constat
renvoie au numéro de la grille (references/checklist.md).

Usage :
    python3 audit_static.py <dossier> [--json] [--max N]

Bibliothèque standard uniquement (Python 3.8+). Détection par motifs : chaque
constat est un indice à vérifier, pas une preuve.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from collections import OrderedDict

SKIP_DIRS = {
    "node_modules", ".git", ".next", ".nuxt", ".svelte-kit", ".output", "dist",
    "build", "out", "coverage", ".cache", ".turbo", ".vercel", ".netlify",
    "vendor", "Pods", ".gradle", "DerivedData", "__pycache__", ".venv", "venv",
    ".idea", ".vscode", "storybook-static", "target", "bin", "obj", "_build", "deps",
    "wp-admin", "wp-includes", "var", "storage", "tmp", "log", "logs", "bower_components", "jspm_packages",
}
CODE_EXT = {
    ".html", ".htm", ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue",
    ".svelte", ".astro", ".php", ".twig", ".liquid", ".erb", ".hbs", ".njk",
    ".ejs", ".pug", ".md", ".mdx", ".py", ".rb", ".go", ".css", ".scss",
    ".sass", ".less", ".swift", ".kt", ".java", ".dart", ".json", ".yml",
    ".yaml", ".toml", ".xml", ".plist", ".mjml", ".blade.php",
    ".cshtml", ".razor", ".cs", ".vb", ".aspx", ".ascx", ".master", ".jsp", ".jspx", ".tag", ".ftl", ".vm",
    ".jinja", ".jinja2", ".j2", ".tpl", ".mustache", ".handlebars", ".eex", ".heex", ".leex", ".ex", ".exs",
    ".slim", ".haml", ".latte", ".phtml", ".gohtml", ".tmpl", ".rs", ".scala", ".marko", ".m", ".mm",
    ".storyboard", ".xib", ".kts", ".gradle", ".config", ".properties", ".ini", ".cfm", ".pl", ".lua",
}
FONT_EXT = {".woff", ".woff2", ".ttf", ".otf", ".eot"}
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"}
MAX_BYTES = 1_500_000

# (id, point de la grille, gravité, libellé, regex, extensions ou None)
# gravité : "haute", "moyenne", "info"
RULES = [
    # --- Accessibilité ---
    ("img-no-alt", "26", "haute", "Image sans attribut alt",
     r"<(img|Image)\b(?![^>]*\balt\s*=)[^>]*>", None),
    ("img-alt-filename", "26", "moyenne", "Texte alternatif qui ressemble à un nom de fichier ou générique",
     r"\balt\s*=\s*['\"](image|img|photo|picture|logo|banner|[\w-]+\.(png|jpe?g|webp|svg|gif))['\"]", None),
    ("outline-none", "28", "haute", "Contour de focus supprimé (outline: none / 0) — vérifier qu'un style :focus-visible le remplace",
     r"outline\s*:\s*(none|0)\b|focus:outline-none|outline-none", None),
    ("tabindex-positive", "28", "moyenne", "tabindex positif (casse l'ordre de navigation au clavier)",
     r"tabindex\s*=\s*['\"{]?\s*[1-9]", None),
    ("div-click", "28", "moyenne", "Élément non interactif cliquable (div/span onClick) — inaccessible au clavier sans role/tabindex/clavier",
     r"<(div|span|li|img)\b[^>]*(onClick|@click|v-on:click|on:click|\(click\)|@onclick|x-on:click|wire:click|ng-click)\b", None),
    ("autoplay", "26", "moyenne", "Lecture automatique d'un média (vérifier : pas de son, bouton pause)",
     r"<(video|audio)\b[^>]*\bautoplay\b|autoPlay(\s|=|>)", None),
    ("zoom-blocked", "27", "haute", "Zoom bloqué dans la balise viewport (user-scalable=no ou maximum-scale=1)",
     r"user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b", None),
    ("html-no-lang", "29", "haute", "Balise <html> sans attribut lang",
     r"<html\b(?![^>]*\blang\s*=)[^>]*>", None),
    ("empty-button", "29", "moyenne", "Bouton ou lien qui semble ne contenir qu'une icône sans aria-label",
     r"<(button|a)\b(?![^>]*aria-label)[^>]*>\s*<(svg|i|img|Icon|[A-Z]\w*Icon)\b[^>]*/?>\s*(</\w+>\s*)?</(button|a)>", None),
    ("input-placeholder-only", "29", "info", "Champ avec placeholder : vérifier qu'il a aussi une étiquette (label)",
     r"<input\b(?![^>]*(aria-label|aria-labelledby|type=['\"](hidden|submit|checkbox|radio)['\"]))[^>]*placeholder=", None),

    # --- Données ---
    ("sensitive-field", "14", "moyenne", "Champ potentiellement non nécessaire ou sensible : justifier sa collecte",
     r"name=['\"](birth|birthdate|date_?of_?birth|dob|gender|sexe|genre|nationality|nationalite|religion|ssn|secu|numero_?secu|health|sante|salary|salaire)['\"]"
     r"|\b(date de naissance|numéro de sécurité sociale|religion|nationalité)\b", None),
    ("prechecked", "13/21", "haute", "Case pré-cochée (interdit pour un consentement ou une option payante)",
     r"type=['\"]checkbox['\"][^>]*\b(?:defaultChecked|checked)(?:\s*=\s*(?:\{\s*true\s*\}|['\"](?:checked|true)?['\"]))?(?=[\s/>])", None),

    # --- Pratiques trompeuses ---
    ("fake-urgency", "21", "haute", "Urgence ou rareté possiblement factice (vérifier qu'elle est réelle)",
     r"(plus que|seulement|only)\s*\{?\s*\w*\s*\}?\s*(en stock|restants?|left in stock|left)\b|derni[eè]re chance|offre expire|expires? in|countdown|compte [àa] rebours"
     r"|personnes? (regardent|consultent)|people (are )?(viewing|watching)", None),
    ("random-stock", "21", "haute", "Valeur aléatoire près d'un stock ou d'un compteur (fausse rareté ?)",
     r"(stock|left|restant|viewers|watching|visiteurs)\w*\s*[:=]\s*Math\.(floor|round|ceil)?\(?\s*Math\.random", None),
    ("confirmshaming", "21", "moyenne", "Libellé de refus culpabilisant",
     r"non merci,? je (pr[ée]f[èe]re|ne veux pas|n'aime pas)|no thanks,? i (prefer|don't want|hate)", None),
    ("claims", "23", "moyenne", "Allégation à prouver (classement, garantie, chiffre, résultat)",
     r"\bn°\s?1\b|\bnum[ée]ro 1\b|\bleader\b|\ble meilleur\b|\bla meilleure\b|\ble moins cher\b|r[ée]sultats? garantis?|satisfait ou rembours[ée]|\b100\s?%\s?(garanti|efficace|naturel|r[ée]ussite)|sans (aucun )?risque|\bbest in class\b|#1\b", None),
    ("green-claims", "23", "haute", "Allégation environnementale (interdite si générique ou non prouvée)",
     r"[ée]co-?responsable|[ée]cologique|respectueux de l'environnement|neutre en carbone|carbone? neutre|z[ée]ro (carbone|[ée]mission)|biod[ée]gradable|eco-friendly|carbon neutral|climate neutral", None),
    ("odr-link", "7", "haute", "Lien vers la plateforme européenne RLL/ODR (supprimée le 20/07/2025) — à retirer",
     r"ec\.europa\.eu/consumers/odr|r[èe]glement en ligne des litiges", None),

    # --- Sécurité ---
    ("secret-key", "S12", "haute", "Secret probable dans le code (clé d'API, jeton, clé privée) — révoquer et déplacer en variable serveur",
     r"AKIA[0-9A-Z]{16}|sk_live_[0-9a-zA-Z]{16,}|rk_live_[0-9a-zA-Z]{16,}|sk-ant-[\w-]{20,}|sk-proj-[\w-]{20,}|\bsk-[A-Za-z0-9]{32,}\b"
     r"|ghp_[0-9A-Za-z]{30,}|github_pat_[0-9A-Za-z_]{30,}|xox[baprs]-[0-9A-Za-z-]{10,}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"
     r"|SG\.[\w-]{20,}\.[\w-]{20,}", None),
    ("google-public-key", "S12", "moyenne", "Clé Google (Firebase, Maps…) dans le code : elle est publique par nature, mais doit être restreinte à votre site ou appli dans la console Google",
     r"AIza[0-9A-Za-z_-]{35}", None),
    ("hardcoded-password", "S12", "haute", "Mot de passe ou secret écrit en dur",
     r"(password|passwd|pwd|secret|api_?key|apikey|token)\s*[:=]\s*['\"][^'\"\s$%{]{6,}['\"]", None),
    ("public-secret-env", "S12", "haute", "Variable publique (exposée au navigateur) qui semble contenir un secret",
     r"(NEXT_PUBLIC|VITE|PUBLIC|NUXT_PUBLIC|REACT_APP|EXPO_PUBLIC|GATSBY|NG_APP)_\w*(SECRET|PRIVATE|SERVICE_ROLE|PASSWORD|SK_|STRIPE_SECRET|OPENAI|ANTHROPIC)\w*", None),
    ("xss-sink", "S5", "haute", "Insertion de HTML brut (risque XSS si le contenu vient d'un utilisateur)",
     r"dangerouslySetInnerHTML|v-html\s*=|\{@html\s|\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML|document\.write\(|\{!!\s|\|\s*safe\b|\|\s*raw\b"
     r"|html_safe|\.raw\(|\braw\s*\(|<%==|<%-\s|bypassSecurityTrust|\[innerHTML\]|th:utext|Html\.Raw\(|escapeXml\s*=\s*['\"]false"
     r"|autoescape\s+(false|off)|\{\{\{[^{]|\bnofilter\b|template\.HTML\(|mark_safe\(|\bMarkup\("
     r"|(echo|print|<\?=)\s*\$_(GET|POST|REQUEST|COOKIE)|\.html\(\s*[\w$.]+\s*\)", None),
    ("eval", "S5", "haute", "Exécution de code dynamique (eval, new Function, exec)",
     r"\beval\s*\(|new Function\s*\(|child_process|\bexecSync\s*\(|\bos\.system\s*\(|subprocess\.(call|run|Popen)\([^)]*shell\s*=\s*True"
     r"|\bshell_exec\s*\(|\bpassthru\s*\(|\bproc_open\s*\(|\b(system|exec|popen)\s*\(\s*\$|create_function\s*\(|\bassert\s*\(\s*\$"
     r"|Runtime\.getRuntime\(\)\.exec|new ProcessBuilder\(|Process\.Start\(|\binstance_eval\b|\bclass_eval\b|%x\{|\bos\.popen\(", None),
    ("sql-concat", "S5", "haute", "Requête SQL construite par concaténation ou interpolation (injection SQL)",
     r"\b((?-i:SELECT\b[^;\n]{0,120}?\bFROM|INSERT\s+INTO|UPDATE\s+[\w.`\"]+\s+SET|DELETE\s+FROM)|(?-i:select\b[^;\n]{0,120}?\bfrom\s+\w+\s+where|insert\s+into\s+\w+|delete\s+from\s+\w+))\b[^;\n]{0,200}?(['\"`]{1,2}\s*\+\s*[\w(]|\$\{|%s['\"]\s*%|\{[a-z_]\w*\})"
     r"|\.(\$queryRawUnsafe|\$executeRawUnsafe)\("
     r"|\b(?-i:SELECT|INSERT|UPDATE|DELETE)\b[^;\n]{0,200}?(['\"]\s*\.\s*\$\w|\$_(GET|POST|REQUEST)|#\{)"
     r"|['\"](?-i:SELECT\b[^'\"\n]*\bFROM|INSERT INTO|UPDATE \w+ SET|DELETE FROM)\b[^'\"\n]*\$[a-zA-Z_]\w*"
     r"|(execute|query|raw|exec)\(\s*f['\"](?-i:SELECT|INSERT|UPDATE|DELETE)|String\.Format\(\s*\"(?-i:SELECT|INSERT|UPDATE|DELETE)"
     r"|Sprintf\(\s*\"(?-i:SELECT|INSERT|UPDATE|DELETE)[^\"]*%[sv]|FromSqlRaw\(\s*\$\"|\.extra\(\s*where\s*="
     r"|\.(where|order|joins|find_by_sql|having|group)\(\s*\"[^\"\n]*#\{|whereRaw\(\s*[\"'][^\"'\n]*\$\w|DB::raw\(\s*[\"'][^\"'\n]*\$\w", None),
    ("weak-hash", "S4", "haute", "Hachage faible (MD5/SHA-1) — interdit pour des mots de passe",
     r"\bmd5\s*\(|createHash\(\s*['\"](md5|sha1)['\"]|hashlib\.(md5|sha1)\(|\bsha1\s*\(|CryptoJS\.(MD5|SHA1)"
     r"|MessageDigest\.getInstance\(\s*\"(MD5|SHA-?1)\"|\b(MD5|SHA1)\.Create\(|\b(md5|sha1)\.(New|Sum)\(|Digest::(MD5|SHA1)"
     r"|\bhash\(\s*['\"](md5|sha1)['\"]", None),
    ("weak-random", "S4", "moyenne", "Générateur aléatoire non cryptographique (Math.random, rand, random…) utilisé pour un jeton, un code ou un identifiant",
     r"(token|code|otp|secret|password|reset|nonce|session)\w*\s*[:=][^;\n]*(Math\.random|\bmt_rand\(|\brand\(|\buniqid\("
     r"|\brandom\.(random|randint|choice|randrange)\(|new Random\(|\bmath/rand\b|\bRandom\.Next\()", None),
    ("cors-wildcard", "S2", "moyenne", "CORS ouvert à toutes les origines",
     r"Access-Control-Allow-Origin['\"]?\s*[:,]\s*['\"]\*['\"]|origin\s*:\s*['\"]\*['\"]|cors\(\s*\)|CORS_ORIGIN_ALLOW_ALL\s*=\s*True|CORS_ALLOW_ALL_ORIGINS\s*=\s*True|allow_origins\s*=\s*\[\s*['\"]\*['\"]"
     r"|@CrossOrigin(\(\s*(origins\s*=\s*)?\"\*\"\s*\))?\s*$|origins\s*\(?\s*['\"]\*['\"]|AllowAnyOrigin\(\)|AllowAllOrigins\s*:\s*true"
     r"|AllowedOrigins\s*:\s*\[\]string\{\s*\"\*\"|'allowed_origins'\s*=>\s*\[\s*'\*'", None),
    ("debug-on", "S2", "moyenne", "Mode debug activé (vérifier qu'il est désactivé en production)",
     r"\bDEBUG\s*=\s*True\b|APP_DEBUG\s*=\s*true|app\.debug\s*=\s*True|display_errors\s*=\s*On|app\.run\([^)]*debug\s*=\s*True"
     r"|WP_DEBUG['\"]?\s*,\s*true|<compilation[^>]*debug=['\"]true|customErrors\s+mode=['\"]Off|include-stacktrace\s*=\s*always"
     r"|UseDeveloperExceptionPage\(|ini_set\(\s*['\"]display_errors['\"]\s*,\s*['\"]?(1|On|true)|error_reporting\(\s*E_ALL\s*\)", None),
    ("unsafe-deserialize", "S8", "haute", "Désérialisation non sûre",
     r"pickle\.loads?\(|yaml\.load\((?![^)]*SafeLoader)|\bunserialize\s*\(|Marshal\.load|ObjectInputStream|BinaryFormatter"
     r"|TypeNameHandling\.(All|Auto|Objects)|jsonpickle\.decode|XMLDecoder|YAML\.load\((?![^)]*safe)", None),
    ("http-link", "S4", "info", "Ressource chargée en http:// (contenu mixte)",
     r"(src|href)\s*=\s*['\"]http://(?!localhost|127\.0\.0\.1)", None),
    ("log-sensitive", "S9", "moyenne", "Journalisation possible de données sensibles (corps de requête, mot de passe, utilisateur complet)",
     r"(console\.log|logger\.\w+|print|log\.\w+|error_log|var_dump|print_r|System\.out\.print\w*|Console\.Write\w*|fmt\.Print\w*|\bputs|Log\.[dievw]|_logger\.\w+)\(?[^)]*(req\.body|request\.body|password|passwd|token|card|cvv|\buser\b\s*\))", None),
    ("cdn-no-sri", "S3", "info", "Script chargé depuis un CDN sans attribut integrity (SRI)",
     r"<script\b(?![^>]*\bintegrity=)[^>]*src=['\"]https://(cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com|code\.jquery\.com|stackpath|ajax\.googleapis\.com|maxcdn\.bootstrapcdn\.com|cdn\.skypack\.dev|esm\.sh|ga\.jspm\.io)", None),
    ("ai-key-client", "S15", "haute", "Appel direct à un fournisseur d'IA depuis le navigateur (clé exposée ?)",
     r"dangerouslyAllowBrowser\s*:\s*true|api\.openai\.com|api\.anthropic\.com|api\.mistral\.ai|generativelanguage\.googleapis\.com", None),
    ("mass-assign", "S14", "moyenne", "Assignation de masse depuis le corps de la requête (risque d'élévation de privilèges)",
     r"\.(update|create|updateMany|findOneAndUpdate|save|fill)\(\s*\{?\s*\.\.\.\s*(req|request)\.body|\.(update|create)\(\s*(req|request)\.body\s*\)|\{\s*data\s*:\s*(req|request)\.body\s*\}"
     r"|params\.permit!|\$guarded\s*=\s*\[\s*\]|(::|->)(create|update|fill|forceFill)\(\s*\$request->all\(\)|fields\s*=\s*['\"]__all__['\"]", None),
]

# Règles sur des balises pouvant s'étendre sur plusieurs lignes (JSX, Vue) :
# appliquées au fichier entier plutôt que ligne par ligne.
MULTILINE_RULES = {"img-no-alt", "html-no-lang", "empty-button", "div-click", "autoplay",
                   "input-placeholder-only", "prechecked", "cdn-no-sri"}

JSONLD_SAFE = re.compile(r"application/ld\+json", re.I)
TABINDEX_MINUS1 = re.compile(r"tabIndex=\{\s*-1\s*\}|tabindex=['\"]-1['\"]", re.I)
EMAIL_HINT = re.compile(r"(email|mail|newsletter|campaign|marketing)", re.I)
UNSUB = re.compile(r"unsubscribe|d[ée]sinscri|d[ée]sabonn|se d[ée]sinscrire|List-Unsubscribe|\{\{\s*unsubscribe|\*\|UNSUB\|\*|\[unsubscribe\]", re.I)
MARKETING_HINT = re.compile(r"promo|offre|newsletter|nouveaut|soldes|discount|campaign|marketing|r[ée]duction|-\d+\s?%", re.I)
FONT_PRO = re.compile(r"@fortawesome/(pro-|fontawesome-pro)|kit\.fontawesome\.com|use\.typekit\.net|fonts\.adobe\.com", re.I)
# Hébergement serverless / edge : un compteur en mémoire n'est pas partagé entre les instances
SERVERLESS_FILES = ["vercel.json", ".vercel", "netlify.toml", "wrangler.toml", "wrangler.json", "wrangler.jsonc",
                    "serverless.yml", "serverless.yaml", "amplify.yml", "open-next.config.ts", "firebase.json",
                    "staticwebapp.config.json", "template.yaml"]
SERVERLESS_DEPS = re.compile(r'"(@opennextjs/cloudflare|@cloudflare/next-on-pages|@cloudflare/workers-types|@vercel/[\w-]+|@netlify/[\w-]+|@astrojs/(vercel|netlify|cloudflare)|@sveltejs/adapter-(vercel|netlify|cloudflare)|hono|serverless-http)"')
MEM_COUNTER = re.compile(r"new\s+Map\s*(<[^>]*>)?\s*\(", re.I)
RATE_HINT = re.compile(r"rate|limit|throttl|attempt|hits|quota|cooldown|lastSent|last_sent|lastAlert", re.I)
NOW_HINT = re.compile(r"Date\.now\(\)|performance\.now\(\)|new Date\(\)\.getTime\(\)")
ERROR_HOOK = re.compile(r"\bonRequestError\b|process\.on\(\s*['\"](uncaughtException|unhandledRejection)|@app\.errorhandler|rescue_from\b|set_exception_handler\(|app\.use\(\s*\(?\s*err\b|addEventListener\(\s*['\"]error['\"]")
EMAIL_SEND = re.compile(r"\.emails\.send\(|\bsendMail\(|sgMail\.send\(|postmark|send_mail\(|Mail::to\(|ActionMailer|fetch\(\s*['\"`]https://api\.(resend\.com|brevo\.com|sendgrid\.com|postmarkapp\.com|mailgun\.net|mailjet\.com)", re.I)
SHARED_STORE = re.compile(r"caches\.default|cache\.put\(|\bKV\b|KVNamespace|\.kv\b|Durable\s*Object|DurableObject|@upstash|Upstash|\bredis\b|ioredis|Ratelimit|RATE_LIMITER|\.limit\(\s*\{\s*key|memcache|@vercel/kv|@netlify/blobs|getStore\(|prisma\.|supabase\.from\(", re.I)
ALERT_HINT = re.compile(r"alert|alerte|notif|incident|monitor", re.I)
NOISE_FILTER = re.compile(r"NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK|NEXT_REDIRECT|isNotFoundError|\b404\b|notFound|status(Code)?\s*[<>]=?\s*500|>=\s*500", re.I)
RESEND_SDK = re.compile(r"\.emails\.send\(")
RESEND_CHECKED = re.compile(r"\{[^}]*\berror\b[^}]*\}\s*=\s*await|\.error\b|if\s*\(\s*!?\s*error\b|throwOnError")
MAIL_API_FETCH = re.compile(r"fetch\(\s*['\"`]https://api\.(resend\.com|brevo\.com|sendgrid\.com|postmarkapp\.com|mailgun\.net|mailjet\.com)")
FETCH_CHECKED = re.compile(r"\.ok\b|\.status\b|raise_for_status")
TEXT_ONLY = {".md", ".mdx", ".txt", ".json", ".yml", ".yaml", ".toml", ".xml", ".csv"}
RISKY_LICENSES = re.compile(r"\b(A?GPL|LGPL|SSPL|BUSL|CC-BY-NC|UNLICENSED|Commercial|Proprietary)\b", re.I)



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
_PHP_HASH_LINE = re.compile(r"^[ \t]*#(?!\[)[^\n]*", re.M)  # « # commentaire » PHP, pas les attributs #[...]
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
    elif ext == ".php":
        text = _PHP_HASH_LINE.sub(_blank, text)
    return text

# Rapports et documentation du dépôt : jamais des pages du site (sinon le rapport précédent
# « contient » des CGV, un médiateur… et fausse la détection des pages légales)
REPORT_FILES = {"telechargement.json", "conformite.md", "crash-test.md", "couverture.md", "textes-visibles.md", "readme.md", "changelog.md",
                "contributing.md", "license", "license.md", "security.md", "audit.md", "code_of_conduct.md"}


def walk(root):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and (not d.startswith(".") or d == ".well-known")]
        for name in filenames:
            if name.lower() in REPORT_FILES:
                continue
            yield os.path.join(dirpath, name)


def is_code(name):
    low = name.lower()
    if low.endswith(".min.js") or low in {"package-lock.json", "yarn.lock", "pnpm-lock.yaml", "composer.lock"}:
        return False
    return os.path.splitext(low)[1] in CODE_EXT or low.startswith(".env")


def git_tracked(root, rel):
    try:
        out = subprocess.run(["git", "-C", root, "ls-files", "--error-unmatch", rel],
                             capture_output=True, text=True, timeout=10)
        return out.returncode == 0
    except Exception:
        return False


def composer_licenses(root):
    """Licences des paquets PHP (composer.json + vendor/)."""
    path = os.path.join(root, "composer.json")
    vendor = os.path.join(root, "vendor")
    if not (os.path.isfile(path) and os.path.isdir(vendor)):
        return [], False
    try:
        deps = [d for d in (json.load(open(path, encoding="utf-8")).get("require") or {}) if "/" in d]
    except Exception:
        return [], False
    out = []
    for dep in deps:
        p = os.path.join(vendor, dep, "composer.json")
        if not os.path.isfile(p):
            continue
        try:
            lic = json.load(open(p, encoding="utf-8")).get("license")
        except Exception:
            continue
        lic = ", ".join(lic) if isinstance(lic, list) else lic
        if not lic or RISKY_LICENSES.search(str(lic)):
            out.append({"paquet": dep, "licence": lic or "aucune déclarée"})
    return out, True


def dependency_licenses(root):
    pkg_path = os.path.join(root, "package.json")
    results = []
    if not os.path.isfile(pkg_path):
        return results, False
    try:
        pkg = json.load(open(pkg_path, encoding="utf-8"))
    except Exception:
        return results, False
    deps = list((pkg.get("dependencies") or {}).keys())
    nm = os.path.join(root, "node_modules")
    if not os.path.isdir(nm):
        return results, False
    for dep in deps:
        p = os.path.join(nm, dep, "package.json")
        if not os.path.isfile(p):
            continue
        try:
            meta = json.load(open(p, encoding="utf-8"))
        except Exception:
            continue
        lic = meta.get("license")
        if isinstance(lic, dict):
            lic = lic.get("type")
        if not lic and meta.get("licenses"):
            lic = ", ".join(str(l.get("type", l)) if isinstance(l, dict) else str(l) for l in meta["licenses"])
        if not lic or RISKY_LICENSES.search(str(lic)):
            results.append({"paquet": dep, "licence": lic or "aucune déclarée"})
    return results, True


# --- Ajustements par occurrence : écarter ou rétrograder les faux positifs connus
_STR = re.compile(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"|`(?:[^`\\\n]|\\.)*`")
TOOLING_PATH = re.compile(r"(^|/)(scripts?|tools?|outils|bin|build|e2e|cypress|playwright|fixtures?|__tests__|tests?|spec|mocks?|seed|seeds|migrations?)/|\.(config|conf)\.\w+$|(^|/)(gulpfile|gruntfile|webpack|rollup|vite|next|nuxt|astro|svelte|tailwind|postcss|eslint|jest|vitest)[\w.-]*\.\w+$", re.I)
DEV_PATH = re.compile(r"(^|/|_|-|\.)(dev|development|local|test|testing|example|sample|ci)(\.|_|-|/|$)|settings/(dev|local|test)", re.I)
TEST_PATH = re.compile(r"(^|/)(tests?|__tests__|spec|specs|fixtures?|mocks?|e2e|cypress|stories)/|\.(test|spec|stories|cy)\.\w+$", re.I)
I18N_PATH = re.compile(r"(^|/)(locales?|i18n|lang|languages|translations?|messages|dictionaries|intl|l10n)/|\.(arb|po|xliff|xlf|strings|resx)$", re.I)
DOCS_PATH = re.compile(r"(^|/)(docs?|documentation|wiki|\.github|adr|notes)/", re.I)
PASSWORD_CTX = re.compile(r"pass(word|wd)?|pwd|mot_?de_?passe|credential|hash_?password|hashPassword", re.I)
CONSENT_CTX = re.compile(r"newsletter|consent|accept|cgv|cgu|terms|conditions|partenaire|partner|marketing|offre|offer|promo|option|assurance|insurance|garantie|warranty|abonn|subscri|prospect|commercial|sms|e-?mail", re.I)
DEFAULT_PASSWORDS = {"changeme", "password", "motdepasse", "admin", "secret", "root", "letmein", "azerty", "qwerty", "123456", "default"}
SQL_TAGGED = re.compile(r"(\bsql|\$queryRaw|\$executeRaw|Prisma\.sql|\bdb\.sql|\bsql\.unsafe|\bhtml|\bgql|\bcss)\s*`[^`]*$")


def blank_strings(line):
    return _STR.sub(lambda m: m.group(0)[0] + " " * (len(m.group(0)) - 2) + m.group(0)[-1], line)


def adjust(rid, sev, rel, line, window):
    """Renvoie la gravité retenue pour cette occurrence, ou None pour l'écarter."""
    if rid == "hardcoded-password":
        m = re.search(r"[:=]\s*['\"]([^'\"]*)['\"]", line)
        val = m.group(1) if m else ""
        if I18N_PATH.search(rel) or re.search(r"\s", val) or re.fullmatch(r"[A-Za-zÀ-ÿ'’-]+", val) and val.lower() not in DEFAULT_PASSWORDS:
            return None  # libellé (« Mot de passe »), mot simple, phrase : pas un secret
        if re.fullmatch(r"(x+|\*+|\.+|your[_-]?\w*|<[^>]+>|\w*_here|placeholder|example\w*|test\w*|dummy\w*|fake\w*|changeit)", val, re.I):
            return None
        if val.startswith("AIza"):
            return None  # clé Google : déjà signalée par la règle dédiée
        if TEST_PATH.search(rel):
            return "info"
    if rid == "secret-key" and TEST_PATH.search(rel):
        return "moyenne"
    if rid == "log-sensitive" and not re.search(r"(req|request)\.body|password|passwd|token|card|cvv|\buser\b\s*\)", blank_strings(line), re.I):
        return None  # le mot n'apparaît que dans un texte (« Password reset email sent »)
    if rid == "weak-random" and not re.search(r"(token|code|otp|secret|password|reset|nonce|session)\w*\s*[:=]", blank_strings(line), re.I):
        return None
    if rid == "sql-concat" and SQL_TAGGED.search(line[: (re.search(r"\$\{", line) or re.search(r"$", line)).start()]):
        return None  # gabarit balisé (sql`…${x}`, $queryRaw`…`) : paramétré automatiquement
    if rid == "weak-hash" and not PASSWORD_CTX.search(blank_strings(window)):
        return "info"  # MD5/SHA-1 pour un cache, une empreinte de fichier, Gravatar : pas une faille
    if rid in ("eval",) and TOOLING_PATH.search(rel):
        return "info"  # outil de build ou de test, pas exposé aux visiteurs
    if rid == "debug-on" and DEV_PATH.search(rel):
        return "info"
    if rid == "prechecked" and not CONSENT_CTX.search(window):
        return "info"  # « Se souvenir de moi » cochée : pas un consentement
    if rid == "img-no-alt" and re.search(r"\{\s*\.\.\.", line):
        return None  # props transmises ({...props}) : alt possible, à vérifier au rendu
    if rid in ("claims", "green-claims", "fake-urgency", "confirmshaming") and (TEST_PATH.search(rel) or DOCS_PATH.search(rel)):
        return None
    return sev


def audit(root, max_per_rule):
    compiled = [(rid, pt, sev, label, re.compile(rx, re.I)) for rid, pt, sev, label, rx, _ in RULES]
    findings = OrderedDict(((rid, sev), {"id": rid, "point": pt, "gravite": sev, "constat": label, "occurrences": [], "total": 0})
                           for rid, pt, sev, label, _ in compiled)
    rule_meta = {rid: (pt, sev, label) for rid, pt, sev, label, _ in compiled}

    def record(rid, sev, occ):
        pt, base, label = rule_meta[rid]
        key = (rid, sev)
        if key not in findings:
            note = {"info": " (gravité réduite : contexte peu risqué, à confirmer)", "moyenne": " (gravité réduite : contexte moins risqué, à confirmer)"}.get(sev, "")
            findings[key] = {"id": rid, "point": pt, "gravite": sev, "constat": label + note, "occurrences": [], "total": 0}
        f = findings[key]
        f["total"] += 1
        if len(f["occurrences"]) < max_per_rule:
            f["occurrences"].append(occ)
    fonts, images, email_templates_no_unsub = [], [], []
    font_pro_hits = []
    env_files = []
    gitignore_env = False
    files_scanned = 0
    has_focus_visible = False
    safe_jsonld = []
    mem_counters, shared_counters, error_hooks, alert_senders, unchecked_sends, unchecked_alerts = [], [], [], [], [], []
    serverless = [f for f in SERVERLESS_FILES if os.path.exists(os.path.join(root, f))]
    # Copie publique faite par fetch_public.py : seulement ce que reçoit le navigateur,
    # donc pas de règle « côté serveur » (compteurs, alertes, envois d'e-mail, licences npm)
    public_copy = os.path.exists(os.path.join(root, "telechargement.json"))
    pj = os.path.join(root, "package.json")
    if os.path.isfile(pj):
        m = SERVERLESS_DEPS.search(open(pj, encoding="utf-8", errors="ignore").read())
        if m:
            serverless.append(m.group(1))

    gi = os.path.join(root, ".gitignore")
    if os.path.isfile(gi):
        gitignore_env = bool(re.search(r"^\s*\.env", open(gi, encoding="utf-8", errors="ignore").read(), re.M))

    for path in walk(root):
        rel = os.path.relpath(path, root).replace(os.sep, "/")
        name = os.path.basename(path)
        ext = os.path.splitext(name)[1].lower()
        if ext in FONT_EXT:
            fonts.append(rel)
            continue
        if ext in IMAGE_EXT and ext != ".svg":
            images.append(rel)
        if name.startswith(".env") and not name.endswith((".example", ".sample", ".template")):
            env_files.append(rel)
        if not is_code(name):
            continue
        try:
            if os.path.getsize(path) > MAX_BYTES:
                continue
            content = open(path, encoding="utf-8", errors="ignore").read()
        except OSError:
            continue
        files_scanned += 1
        if ":focus-visible" in content or "focus-visible:" in content:
            has_focus_visible = True
        if FONT_PRO.search(content):
            font_pro_hits.append(rel)

        original_lines = content.splitlines()
        content = strip_comments(content, ext)
        lines = content.splitlines()
        for rid, pt, sev, label, rx in compiled:
            # Les secrets dans les .env non commités sont normaux : on les traite à part.
            if name.startswith(".env") and rid in {"secret-key", "hardcoded-password"}:
                continue
            if rid in MULTILINE_RULES:
                for m in rx.finditer(content):
                    if len(m.group(0)) > 1500:
                        continue
                    line_no = content.count("\n", 0, m.start()) + 1
                    window = content[max(0, m.start() - 300): m.end() + 300]
                    sev2 = adjust(rid, sev, rel, m.group(0), window)
                    if sev2 is None:
                        continue
                    snippet = " ".join(original_lines[line_no - 1].split()) if line_no <= len(original_lines) else " ".join(m.group(0).split())
                    record(rid, sev2, {"fichier": rel, "ligne": line_no, "extrait": snippet[:160]})
                continue
            for i, line in enumerate(lines, 1):
                if len(line) > 3000:
                    continue
                if rx.search(line):
                    window = "\n".join(lines[max(0, i - 4):i + 3])
                    # JSON-LD statique échappé (recommandation Next.js) : pas une faille XSS
                    if rid == "xss-sink" and JSONLD_SAFE.search(window) and re.search(r"JSON\.stringify", window) \
                            and re.search(r"replace\([^)]*<", window):
                        safe_jsonld.append(f"{rel}:{i}")
                        continue
                    if rid == "xss-sink" and JSONLD_SAFE.search(window) and re.search(r"JSON\.stringify", window):
                        record(rid, "moyenne", {"fichier": rel, "ligne": i, "extrait": line.strip()[:160] + " (JSON-LD sans échapper « < » : risque seulement si une donnée vient d'un utilisateur ; ajouter .replace(/</g, '\\u003c'))"})
                        continue
                    # Cible de focus programmatique (tabIndex=-1) : pas un élément atteignable au clavier
                    if rid == "outline-none" and TABINDEX_MINUS1.search(window):
                        continue
                    sev2 = adjust(rid, sev, rel, line, window)
                    if sev2 is None:
                        continue
                    record(rid, sev2, {"fichier": rel, "ligne": i, "extrait": original_lines[i - 1].strip()[:160]})

        # Limitation anti-abus en mémoire, alertes par e-mail, envoi non vérifié (code seulement)
        if ext not in TEXT_ONLY:
            if MEM_COUNTER.search(content) and NOW_HINT.search(content) and RATE_HINT.search(content):
                (shared_counters if SHARED_STORE.search(content) else mem_counters).append(rel)
            if ERROR_HOOK.search(content):
                error_hooks.append((rel, content))
            if EMAIL_SEND.search(content) and (ALERT_HINT.search(rel) or ERROR_HOOK.search(content)):
                alert_senders.append((rel, content))
            if (RESEND_SDK.search(content) and not RESEND_CHECKED.search(content)) or \
                    (MAIL_API_FETCH.search(content) and not FETCH_CHECKED.search(content)):
                # Alerte interne « tir et oubli » : personne n'attend de message « envoyé »
                (unchecked_alerts if (ALERT_HINT.search(rel) and not re.search(r"(form|contact|devis|quote|newsletter|signup|inscri)", rel, re.I))
                 else unchecked_sends).append(rel)

        # E-mails marketing sans lien de désinscription
        if EMAIL_HINT.search(rel) and ext in {".html", ".htm", ".tsx", ".jsx", ".mjml", ".hbs", ".handlebars", ".njk", ".ejs", ".liquid", ".twig", ".vue",
                                         ".erb", ".cshtml", ".razor", ".jinja", ".jinja2", ".j2", ".mustache", ".eex", ".heex", ".ftl", ".jsp"}:
            if MARKETING_HINT.search(content) and not UNSUB.search(content):
                email_templates_no_unsub.append(rel)

    # outline:none est moins grave s'il existe des styles :focus-visible
    if has_focus_visible and findings[("outline-none", "haute")]["total"]:
        findings[("outline-none", "haute")]["gravite"] = "moyenne"
        findings[("outline-none", "haute")]["constat"] += " (des styles :focus-visible existent dans le projet)"

    secrets_in_git = [e for e in env_files if git_tracked(root, e)]
    deps, deps_checked = dependency_licenses(root)
    php_deps, php_checked = composer_licenses(root)
    deps, deps_checked = deps + php_deps, deps_checked or php_checked

    extra = []
    if secrets_in_git:
        extra.append({"id": "env-tracked", "point": "S12", "gravite": "haute",
                      "constat": "Fichier .env suivi par Git : secrets exposés dans l'historique (révoquer les clés, retirer du dépôt)",
                      "occurrences": secrets_in_git})
    if env_files and not gitignore_env:
        extra.append({"id": "env-not-ignored", "point": "S12", "gravite": "haute",
                      "constat": ".env présent mais non ignoré par .gitignore", "occurrences": env_files})
    if email_templates_no_unsub:
        extra.append({"id": "email-no-unsub", "point": "25", "gravite": "haute",
                      "constat": "Gabarit d'e-mail marketing sans lien de désinscription détecté",
                      "occurrences": email_templates_no_unsub[:20]})
    if font_pro_hits:
        extra.append({"id": "font-pro", "point": "24", "gravite": "moyenne",
                      "constat": "Polices ou icônes sous licence payante (Font Awesome Pro, Adobe Fonts) : licence à justifier, ne pas publier le kit",
                      "occurrences": font_pro_hits[:20]})
    if fonts:
        extra.append({"id": "fonts", "point": "24", "gravite": "info",
                      "constat": "Fichiers de polices embarqués : vérifier la licence web de chacun",
                      "occurrences": sorted(set(os.path.basename(f) for f in fonts))[:40]})
    if images:
        extra.append({"id": "images", "point": "24", "gravite": "info",
                      "constat": f"{len(images)} images matricielles : vérifier la provenance et la licence (photos de banque, droit à l'image)",
                      "occurrences": images[:15]})
    if safe_jsonld:
        extra.append({"id": "jsonld-safe", "point": "S5", "gravite": "info",
                      "constat": "Données structurées JSON-LD insérées en HTML brut mais échappées (JSON.stringify + remplacement de « < ») : sûr si le contenu n'est pas fourni par un visiteur",
                      "occurrences": safe_jsonld[:10]})
    if not public_copy and mem_counters:
        if serverless:
            extra.append({"id": "mem-counter", "point": "S13", "gravite": "moyenne",
                          "constat": f"Limitation anti-abus en mémoire (Map + horodatage) sur un hébergement serverless/edge ({', '.join(serverless[:3])}) : chaque instance a son propre compteur, la limite est contournable. Utiliser un stockage partagé (KV, Durable Objects, Upstash, Redis) ou la règle de limitation de l'hébergeur (Cloudflare Rate Limiting, Vercel Firewall)",
                          "occurrences": mem_counters[:10]})
        else:
            extra.append({"id": "mem-counter", "point": "S13", "gravite": "info",
                          "constat": "Limitation anti-abus en mémoire : suffisante sur un seul serveur, contournable s'il y a plusieurs instances ou un hébergement serverless",
                          "occurrences": mem_counters[:10]})
    if not public_copy and shared_counters:
        extra.append({"id": "shared-counter", "point": "S13", "gravite": "info",
                      "constat": "Limitation anti-abus avec stockage partagé (cache, KV, Redis…) et compteur en mémoire : bon si la mémoire ne sert que de secours ; vérifier à la lecture",
                      "occurrences": shared_counters[:10]})
    if not public_copy and alert_senders and error_hooks:
        joined = "\n".join(c for _, c in error_hooks + alert_senders)
        problems = []
        if not NOISE_FILTER.search(joined):
            problems.append("les 404 et redirections ne semblent pas ignorées (NEXT_NOT_FOUND, NEXT_HTTP_ERROR_FALLBACK, NEXT_REDIRECT, statut < 500)")
        if serverless and any((MEM_COUNTER.search(c) or re.search(r"(let|var)\s+\w*(last|Last)\w*\s*=", c)) and not SHARED_STORE.search(c) for _, c in alert_senders):
            problems.append("la limite d'envoi est en mémoire, donc non partagée entre les instances serverless")
        extra.append({"id": "alert-email", "point": "S9", "gravite": "moyenne" if problems else "info",
                      "constat": "Alerte par e-mail sur erreur serveur : " + ("; ".join(problems) + " → un robot peut déclencher des centaines d'e-mails, épuiser le quota du service d'envoi et faire bloquer l'adresse" if problems else "vérifier qu'elle ignore les 404, qu'elle est limitée de façon partagée et qu'elle ne contient pas de données personnelles"),
                      "occurrences": sorted({r for r, _ in error_hooks + alert_senders})[:10]})
    if not public_copy and unchecked_sends:
        extra.append({"id": "unchecked-send", "point": "E4", "gravite": "moyenne",
                      "constat": "Envoi d'e-mail dont le résultat ne semble pas vérifié (Resend renvoie { error } sans lever d'exception ; fetch ne lève rien sur une erreur 4xx/5xx) : le formulaire peut afficher « envoyé » alors que rien n'est parti",
                      "occurrences": unchecked_sends[:10]})
    if not public_copy and unchecked_alerts:
        extra.append({"id": "unchecked-alert", "point": "E4", "gravite": "info",
                      "constat": "Alerte interne envoyée sans vérifier le résultat : sans gravité pour les visiteurs, mais une clé ou une adresse invalide passerait inaperçue (vérifier response.ok et journaliser l'échec)",
                      "occurrences": unchecked_alerts[:10]})
    if deps:
        extra.append({"id": "dep-licenses", "point": "24", "gravite": "moyenne",
                      "constat": "Dépendances avec une licence contraignante ou absente (GPL/AGPL/non commerciale/aucune)",
                      "occurrences": deps})

    return {
        "root": os.path.abspath(root),
        "files_scanned": files_scanned,
        "dependances_licences_verifiees": deps_checked,
        "constats": [v for v in findings.values() if v["total"]],
        "autres": extra,
    }


SEV_ICON = {"haute": "🔴", "moyenne": "🟠", "info": "🔵"}
SEV_ORDER = {"haute": 0, "moyenne": 1, "info": 2}


def render(r):
    out = [f"# Analyse statique — {r['root']}", "", f"Fichiers analysés : {r['files_scanned']}", ""]
    items = sorted(r["constats"] + r["autres"], key=lambda x: (SEV_ORDER[x["gravite"]], str(x["point"])))
    if not items:
        out.append("Aucun constat.")
    for it in items:
        total = it.get("total", len(it["occurrences"]))
        out.append(f"## {SEV_ICON[it['gravite']]} [{it['point']}] {it['constat']} ({total})")
        for occ in it["occurrences"]:
            if isinstance(occ, dict) and "fichier" in occ:
                out.append(f"- `{occ['fichier']}:{occ['ligne']}` — `{occ['extrait']}`")
            elif isinstance(occ, dict):
                out.append(f"- {occ.get('paquet')} : {occ.get('licence')}")
            else:
                out.append(f"- {occ}")
        if total > len(it["occurrences"]):
            out.append(f"- … {total - len(it['occurrences'])} autre(s)")
        out.append("")
    if not r["dependances_licences_verifiees"]:
        out.append("_Licences des dépendances non vérifiées par ce script (il lit npm et Composer installés). Autres stacks : "
                   "pip-licenses (Python), license_finder (Ruby, Java, Go, .NET…), cargo-license (Rust)._")
    out.append("_Détection par motifs : chaque constat est à confirmer en lisant le code. Compléter par les tests en navigateur (browser_probe.js) et HTTP (check_headers.py)._")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("root")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--max", type=int, default=8, help="Occurrences affichées par règle (défaut 8)")
    a = ap.parse_args()
    if not os.path.isdir(a.root):
        print(f"Dossier introuvable : {a.root}", file=sys.stderr)
        sys.exit(1)
    r = audit(a.root, a.max)
    print(json.dumps(r, ensure_ascii=False, indent=2) if a.json else render(r))


if __name__ == "__main__":
    main()
