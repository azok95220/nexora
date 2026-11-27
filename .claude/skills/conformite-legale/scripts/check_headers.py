#!/usr/bin/env python3
"""Vérifie la sécurité HTTP d'un site : HTTPS et redirections (avec et sans www),
en-têtes de sécurité, attributs des cookies, hébergeur réellement contacté, et
(option) fichiers sensibles exposés ou adresses inconnues qui font planter le site.

Usage :
    python3 check_headers.py <url> [--probe-files] [--resolve-via 1.1.1.1]
                             [--mentions <url des mentions légales> | --no-mentions] [--json]

- Hébergeur détecté : d'après les en-têtes (x-vercel-id, cf-ray, x-nf-request-id…)
  et l'adresse IP réellement contactée (plages connues).
- --resolve-via 1.1.1.1 (ou 8.8.8.8) : résout le nom avec un DNS public (DNS sur
  HTTPS) et force cette IP, comme `curl --resolve`. Utile juste après un changement
  d'hébergeur, quand l'ordinateur garde l'ancienne adresse en cache. Envoie le nom
  de domaine au résolveur public choisi.
- Mentions légales : la page est trouvée dans les liens de l'accueil (ou donnée
  avec --mentions) ; le nom d'hébergeur qu'elle cite est comparé à l'hébergeur
  détecté.
- --probe-files : quelques requêtes GET normales vers des chemins sensibles
  (/.env, /.git/config…) et deux adresses au hasard. Signale un fichier servi,
  une erreur serveur (5xx), une réponse lente (> 3 s) ou une absence de réponse.

N'utiliser que sur le site de l'utilisateur (local, préproduction ou production
avec son accord). Bibliothèque standard uniquement.
"""

import argparse
import html
import http.client
import ipaddress
import json
import random
import re
import socket
import ssl
import string
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

UA = "conformite-legale-check/1.4"
TIMEOUT = 15
PROBE_TIMEOUT = 10
SLOW = 3.0

EXPECTED = [
    ("strict-transport-security", "S4/S11", "haute", "HSTS absent : ajouter Strict-Transport-Security: max-age=31536000; includeSubDomains", "https_only"),
    ("content-security-policy", "S11", "moyenne", "CSP absente : ajouter une Content-Security-Policy (commencer en Report-Only)", None),
    ("x-content-type-options", "S11", "moyenne", "X-Content-Type-Options absent : ajouter nosniff", None),
    ("referrer-policy", "S11", "info", "Referrer-Policy absent : ajouter strict-origin-when-cross-origin", None),
    ("permissions-policy", "S11", "info", "Permissions-Policy absent : désactiver camera, microphone, geolocation si inutilisés", None),
]
SENSITIVE_PATHS = [
    "/.env", "/.env.local", "/.env.production", "/.git/HEAD", "/.git/config", "/.DS_Store",
    "/phpinfo.php", "/server-status", "/wp-config.php.bak", "/config.json", "/backup.zip",
    "/.vscode/settings.json", "/docker-compose.yml",
]
# Signature du vrai fichier : sans elle, un 200 n'est pas compté comme une fuite
# (beaucoup de sites renvoient leur page d'accueil ou un JSON « introuvable » avec 200).
FILE_SIGS = {
    "/.env": (rb"(?m)^\s*(export\s+)?[A-Z][A-Z0-9_]{1,60}\s*=", "haute"),
    "/.git/HEAD": (rb"^(ref: refs/|[0-9a-f]{40}\s*$)", "haute"),
    "/.git/config": (rb"\[core\]", "haute"),
    "/.DS_Store": (rb"^\x00\x00\x00\x01Bud1", "moyenne"),
    "/phpinfo.php": (rb"phpinfo\(\)|PHP Version|PHP License", "haute"),
    "/server-status": (rb"Apache Server Status|Server uptime|Total accesses", "moyenne"),
    "/wp-config.php.bak": (rb"DB_PASSWORD|DB_NAME|table_prefix", "haute"),
    "/config.json": (rb"(?i)\"[^\"]*(password|secret|private_?key|api_?key|token)[^\"]*\"\s*:\s*\"[^\"]{6,}", "haute"),
    "/backup.zip": (rb"^PK\x03\x04", "haute"),
    "/.vscode/settings.json": (rb"^\s*\{", "info"),
    "/docker-compose.yml": (rb"(?m)^(services|version)\s*:", "moyenne"),
}

# Hébergeurs : signatures d'en-têtes
HEADER_SIGS = [
    ("Vercel", lambda h: "x-vercel-id" in h or h.get("server", "").lower() == "vercel"),
    ("Cloudflare", lambda h: "cf-ray" in h or h.get("server", "").lower() == "cloudflare"),
    ("Netlify", lambda h: "x-nf-request-id" in h or "netlify" in h.get("server", "").lower()),
    ("GitHub Pages", lambda h: "x-github-request-id" in h or h.get("server", "") == "GitHub.com"),
    ("AWS (CloudFront)", lambda h: "x-amz-cf-id" in h),
    ("AWS (S3)", lambda h: h.get("server", "") == "AmazonS3"),
    ("Microsoft Azure", lambda h: "x-azure-ref" in h or "x-ms-request-id" in h),
    ("Render", lambda h: "x-render-origin-server" in h or "rndr-id" in h),
    ("Fly.io", lambda h: "fly-request-id" in h or h.get("server", "").lower() == "fly/"),
    ("Railway", lambda h: any(k.startswith("x-railway") for k in h) or "railway" in h.get("server", "").lower()),
    ("Google (Firebase / Cloud)", lambda h: h.get("server", "").lower() in ("google frontend", "gws", "gse") or "x-cloud-trace-context" in h),
    ("Fastly (Firebase Hosting, GitHub Pages…)", lambda h: "cache-" in h.get("x-served-by", "") or "fastly" in h.get("via", "").lower()),
]
# Hébergeurs : plages d'adresses IP connues
IP_RANGES = [
    ("Cloudflare", ["173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "141.101.64.0/18",
                    "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22", "198.41.128.0/17",
                    "162.158.0.0/15", "104.16.0.0/13", "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
                    "2606:4700::/32", "2803:f800::/32", "2405:b500::/32", "2405:8100::/32", "2a06:98c0::/29", "2c0f:f248::/32"]),
    ("Vercel", ["76.76.21.0/24", "216.198.79.0/24", "66.33.60.0/24"]),
    ("GitHub Pages", ["185.199.108.0/22", "2606:50c0::/32"]),
    ("Netlify", ["75.2.60.5/32"]),
]
# Noms cherchés dans les mentions légales
HOST_NAMES = {
    "Vercel": r"vercel", "Cloudflare": r"cloudflare", "Netlify": r"netlify", "GitHub Pages": r"github",
    "AWS": r"amazon web services|\baws\b", "Microsoft Azure": r"microsoft|azure", "Render": r"render services|\brender\b",
    "Fly.io": r"fly\.io", "Railway": r"railway", "Google": r"google|firebase", "OVHcloud": r"\bovh",
    "o2switch": r"o2switch", "IONOS": r"ionos|1&1", "Hostinger": r"hostinger", "Infomaniak": r"infomaniak",
    "Scaleway": r"scaleway|online sas", "Gandi": r"gandi", "PlanetHoster": r"planethoster", "LWS": r"\blws\b|ligne web services",
}
KNOWN_ADDRESS = {"Vercel": (r"covina", "Vercel Inc., Covina, Californie, États-Unis (adresse exacte : vercel.com/legal)"),
                 "Cloudflare": (r"townsend", "Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis")}
MENTIONS_LINK = re.compile(r"""href=["']([^"'#]*(?:mentions|legal-notice|legal|imprint|impressum)[^"'#]*)["']""", re.I)
CHALLENGE = re.compile(r"(Vercel Security Checkpoint|Just a moment\.\.\.|Attention Required! \| Cloudflare|cf-chl-|challenge-platform|Checking your browser|DDoS protection by|_Incapsula_Resource|px-captcha|perimeterx)", re.I)

PEERS = {}   # nom d'hôte -> IP réellement contactée
FORCED = {}  # nom d'hôte -> IP imposée (--resolve-via)


class _Conn(http.client.HTTPConnection):
    def connect(self):
        ip = FORCED.get(self.host)
        if ip:
            self.sock = socket.create_connection((ip, self.port), self.timeout)
        else:
            super().connect()
        PEERS[self.host] = self.sock.getpeername()[0]


class _SConn(http.client.HTTPSConnection):
    def connect(self):
        sock = socket.create_connection((FORCED.get(self.host) or self.host, self.port), self.timeout)
        PEERS[self.host] = sock.getpeername()[0]
        self.sock = self._context.wrap_socket(sock, server_hostname=self.host)


class _H(urllib.request.HTTPHandler):
    def http_open(self, req):
        return self.do_open(_Conn, req)


class _HS(urllib.request.HTTPSHandler):
    def https_open(self, req):
        return self.do_open(_SConn, req, context=self._context)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def _get(url, limit, timeout):
    opener = urllib.request.build_opener(_H(), _HS(context=ssl.create_default_context()), NoRedirect())
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        resp = opener.open(req, timeout=timeout)
        return resp.status, resp.headers, resp.read(limit)
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read(limit) if e.fp else b""


def fetch(url, follow=True, limit=4096, timeout=TIMEOUT):
    """GET ; suit les redirections à la main (301, 302, 303, 307, 308) jusqu'à 10 sauts."""
    for _ in range(10):
        st, h, body = _get(url, limit, timeout)
        loc = h.get("Location") if h else None
        if not follow or st not in (301, 302, 303, 307, 308) or not loc:
            return st, url, h, body
        url = urllib.parse.urljoin(url, loc)
    return st, url, h, body


def doh(name, rtype, via):
    """Résolution DNS sur HTTPS (JSON) via Cloudflare ou Google."""
    base = "https://dns.google/resolve" if via in ("8.8.8.8", "8.8.4.4", "google") else "https://cloudflare-dns.com/dns-query"
    url = f"{base}?name={urllib.parse.quote(name)}&type={rtype}"
    req = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        data = json.load(r)
    return [(a.get("type"), a.get("data", "").rstrip(".")) for a in data.get("Answer", [])]


def local_ips(host):
    try:
        return sorted({ai[4][0] for ai in socket.getaddrinfo(host, None, proto=socket.IPPROTO_TCP)})
    except socket.gaierror:
        return []


def provider_by_ip(ip):
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return None
    for name, nets in IP_RANGES:
        if any(addr in ipaddress.ip_network(n) for n in nets):
            return name
    return None


def providers(headers_lower, ip):
    found = [name for name, test in HEADER_SIGS if test(headers_lower)]
    by_ip = provider_by_ip(ip) if ip else None
    if by_ip and by_ip not in found:
        found.append(by_ip + " (d'après l'IP)")
    return found


def page_text(raw):
    t = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", raw)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", html.unescape(t))


def check_variants(parsed, main_host, findings):
    """http://apex, http://www, https://www doivent finir en https sur l'adresse principale."""
    apex = parsed.hostname[4:] if parsed.hostname.startswith("www.") else parsed.hostname
    path = parsed.path or "/"
    results = []
    for scheme, host in (("http", apex), ("http", "www." + apex), ("https", "www." + apex), ("https", apex)):
        url = f"{scheme}://{host}{path}"
        if (scheme, host) == (parsed.scheme, parsed.hostname):
            continue
        if not local_ips(host) and host not in FORCED:
            results.append({"url": url, "resultat": "n'existe pas (pas d'adresse DNS)"})
            continue
        try:
            st1, _, h1, _ = fetch(url, follow=False)
            loc = (h1.get("Location", "") if h1 else "")
            st, final, _, _ = fetch(url)
        except Exception as e:
            results.append({"url": url, "resultat": f"injoignable ({type(e).__name__})"})
            if scheme == "https":
                findings.append({"id": "variant", "point": "S4", "gravite": "moyenne", "constat": f"{url} ne répond pas (certificat ou nom absent ?) : un visiteur qui tape cette adresse voit une erreur"})
            continue
        f = urllib.parse.urlparse(final)
        ok = f.scheme == "https" and f.hostname == main_host
        results.append({"url": url, "premier_statut": st1, "location": loc, "url_finale": final, "statut_final": st, "ok": ok})
        if scheme == "http" and not 300 <= st1 < 400:
            findings.append({"id": "variant", "point": "S4", "gravite": "haute", "constat": f"{url} répond {st1} en clair, sans redirection vers https://"})
        if f.scheme != "https":
            findings.append({"id": "variant", "point": "S4", "gravite": "haute", "constat": f"{url} finit en http:// non chiffré ({final})"})
        elif f.hostname != main_host:
            findings.append({"id": "variant", "point": "S4", "gravite": "info", "constat": f"{url} finit sur {f.hostname} et non sur l'adresse principale {main_host} (doublon d'adresse)"})
    return results


def check_mentions(base_url, home_body, mentions, detected, findings):
    url = mentions
    if not url:
        m = MENTIONS_LINK.search(home_body)
        if not m:
            return {"url": None, "resultat": "page des mentions légales non trouvée dans les liens de l'accueil (utiliser --mentions <url>)"}
        url = urllib.parse.urljoin(base_url, html.unescape(m.group(1)))
    try:
        st, final, _, body = fetch(url, limit=2_000_000)
    except Exception as e:
        return {"url": url, "resultat": f"injoignable ({type(e).__name__})"}
    text = page_text(body.decode("utf-8", "ignore"))
    cited = [name for name, pat in HOST_NAMES.items() if re.search(pat, text, re.I)]
    res = {"url": final, "statut": st, "hebergeurs_cites": cited}
    if st >= 400:
        res["resultat"] = f"statut {st}"
        return res
    det = [d.split(" (")[0] for d in detected if not d.startswith("Fastly")]
    det_norm = {"AWS (CloudFront)": "AWS", "AWS (S3)": "AWS", "Google (Firebase / Cloud)": "Google"}
    det = [det_norm.get(d, d) for d in det]
    if det and not cited:
        findings.append({"id": "host-mentions", "point": "1/H3", "gravite": "haute", "constat": f"Aucun hébergeur connu cité dans les mentions légales ({final}) ; hébergeur détecté : {', '.join(det)}. Vérifier à la lecture."})
    elif det and not any(d in cited for d in det):
        findings.append({"id": "host-mentions", "point": "1/H3", "gravite": "haute", "constat": f"Mentions légales : hébergeur cité {', '.join(cited)}, mais le site est servi par {', '.join(det)} (mention obligatoire inexacte ?)"})
    for d in det:
        if d in cited and d in KNOWN_ADDRESS and not re.search(KNOWN_ADDRESS[d][0], text, re.I):
            findings.append({"id": "host-mentions", "point": "1/H3", "gravite": "moyenne", "constat": f"Mentions légales : {d} est cité, mais son adresse ne semble pas indiquée (référence : {KNOWN_ADDRESS[d][1]})"})
    stale = [c for c in cited if det and c not in det and c not in ("Google",)]
    if stale and any(d in cited for d in det):
        findings.append({"id": "host-mentions", "point": "1/H3", "gravite": "info", "constat": f"Mentions légales : citent aussi {', '.join(stale)} — ancien hébergeur ou autre prestataire ? Vérifier à la lecture."})
    return res


def probe(base, findings):
    rnd = "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(10))
    paths = SENSITIVE_PATHS + [f"/test-en-regle-{rnd}.php", f"/{rnd}/config.yml"]
    rows, exposed = [], []
    for p in paths:
        t0 = time.monotonic()
        try:
            st, _, h, body = fetch(base + p, follow=False, timeout=PROBE_TIMEOUT, limit=8192)
            dt = time.monotonic() - t0
        except Exception as e:
            dt = time.monotonic() - t0
            rows.append({"chemin": p, "statut": None, "duree_s": round(dt, 2), "note": f"pas de réponse ({type(e).__name__})"})
            continue
        ctype = (h.get("Content-Type", "") if h else "").lower()
        text = body[:400].decode("utf-8", "ignore")
        looks_html = "text/html" in ctype or "<html" in text.lower() or "<!doctype" in text.lower()
        note = ""
        sig = FILE_SIGS.get(p) or (FILE_SIGS["/.env"] if p.startswith("/.env") else None)
        if st == 200 and sig and re.search(sig[0], body):
            note = "FICHIER SERVI"
            exposed.append((p, sig[1]))
        elif st == 200 and sig and not looks_html and text.strip():
            note = "200 sans le contenu attendu (pas compté)"
        elif st >= 500:
            note = "erreur serveur"
        elif dt > SLOW:
            note = "lent"
        elif st == 200 and p.startswith(("/test-en-regle-", f"/{rnd}")):
            note = "page renvoyée au lieu de « introuvable »"
        rows.append({"chemin": p, "statut": st, "duree_s": round(dt, 2), "note": note})
    for p, sev in exposed:
        findings.append({"id": "exposed-file", "point": "S2", "gravite": sev, "constat": f"Fichier sensible accessible publiquement : {p} (contenu reconnu)"})
    errs = [r for r in rows if r["statut"] and r["statut"] >= 500]
    slow = [r for r in rows if r["note"] == "lent"]
    dead = [r for r in rows if r["statut"] is None]
    if errs:
        findings.append({"id": "probe-5xx", "point": "S10", "gravite": "moyenne", "constat": f"Une adresse inconnue fait planter le site (erreur {errs[0]['statut']} sur {', '.join(r['chemin'] for r in errs[:4])}) : un robot qui fouille peut le saturer ou déclencher des alertes en masse"})
    if slow:
        findings.append({"id": "probe-slow", "point": "S10", "gravite": "moyenne", "constat": f"Réponse lente (> {SLOW:.0f} s) sur {', '.join(r['chemin'] for r in slow[:4])} : une adresse inconnue devrait répondre « introuvable » tout de suite"})
    if dead:
        findings.append({"id": "probe-dead", "point": "S10", "gravite": "moyenne", "constat": f"Pas de réponse sur {', '.join(r['chemin'] for r in dead[:4])} (délai de {PROBE_TIMEOUT} s dépassé ou connexion coupée)"})
    soft = [r for r in rows if r["note"].startswith("page renvoyée")]
    if soft:
        findings.append({"id": "soft-404", "point": "S10", "gravite": "info", "constat": "Une adresse au hasard renvoie une page (200) au lieu de « introuvable » (404) : sans gravité, mais les robots continuent à fouiller"})
    return rows


def check(url, probe_files, resolve_via=None, mentions=None, no_mentions=False):
    findings = []
    info = {"url": url}
    parsed = urllib.parse.urlparse(url)
    host = parsed.hostname or ""
    is_local = host in {"localhost", "127.0.0.1", "::1"} or host.endswith(".localhost")

    # Résolution DNS : ordinateur local, puis (option) DNS public
    dns = {"local": local_ips(host)}
    if resolve_via and not is_local:
        try:
            ans = doh(host, "A", resolve_via)
            dns["public"] = [d for t, d in ans if t == 1]
            dns["cname"] = [d for t, d in ans if t == 5]
            if dns["public"]:
                FORCED[host] = dns["public"][0]
            for var in {host, "www." + host if not host.startswith("www.") else host[4:]}:
                if var != host:
                    a2 = [d for t, d in doh(var, "A", resolve_via) if t == 1]
                    if a2:
                        FORCED[var] = a2[0]
            if dns["public"] and dns["local"] and not set(dns["public"]) & set(dns["local"]):
                findings.append({"id": "host-dns", "point": "H3", "gravite": "moyenne",
                                 "constat": f"Votre ordinateur ({', '.join(dns['local'][:2])}) et le DNS public ({', '.join(dns['public'][:2])}) ne donnent pas la même adresse : cache DNS ou ancien hébergeur encore actif. Les tests utilisent l'adresse du DNS public."})
        except Exception as e:
            dns["public_erreur"] = f"{type(e).__name__}: {e}"
    info["dns"] = dns

    try:
        status, final_url, headers, body = fetch(url, limit=2_000_000)
    except Exception as e:
        return {"url": url, "erreur": f"Site injoignable : {e}", "dns": dns, "constats": []}
    info.update({"statut": status, "url_finale": final_url})
    final = urllib.parse.urlparse(final_url)
    ip = PEERS.get(final.hostname or host)
    lower = {k.lower(): v for k, v in headers.items()}
    detected = providers(lower, ip)
    info["ip_contactee"] = ip
    info["hebergeur_detecte"] = detected
    body_text = body.decode("utf-8", "ignore")

    # Page de protection anti-robots (Vercel, Cloudflare…) : les en-têtes reçus sont ceux du contrôle, pas du site
    if CHALLENGE.search(body_text[:20000]):
        return {**info, "bloque_anti_robots": True,
                "erreur": "Réponse = page de protection anti-robots (Vercel Security Checkpoint, Cloudflare…). "
                          "Les en-têtes reçus ne sont pas ceux du site : tester la version de production en local "
                          "(build + start) ou désactiver temporairement la protection.", "constats": findings}

    if final.scheme != "https" and not is_local:
        findings.append({"id": "no-https", "point": "S4", "gravite": "haute", "constat": "Le site n'est pas servi en HTTPS"})

    # Redirections http -> https, avec et sans www
    if not is_local and final.hostname:
        info["variantes"] = check_variants(parsed, final.hostname, findings)

    info["en_tetes"] = {k: lower[k] for k in sorted(lower) if k in {e[0] for e in EXPECTED} or k in {"x-frame-options", "server", "x-powered-by"}}

    for name, point, sev, msg, cond in EXPECTED:
        if cond == "https_only" and (final.scheme != "https" or is_local):
            continue
        if name not in lower:
            findings.append({"id": "missing-" + name, "point": point, "gravite": sev, "constat": msg})
    hsts = lower.get("strict-transport-security", "")
    if hsts and "preload" not in hsts.lower() and not is_local:
        findings.append({"id": "hsts-no-preload", "point": "S4", "gravite": "info", "constat": "HSTS sans « preload » : la toute première visite en http:// reste possible (ajouter preload puis inscrire le domaine sur hstspreload.org si tous les sous-domaines sont en https)"})

    csp = lower.get("content-security-policy", "")
    if "frame-ancestors" not in csp and "x-frame-options" not in lower:
        findings.append({"id": "clickjacking", "point": "S11", "gravite": "moyenne",
                         "constat": "Protection contre l'intégration en iframe (clickjacking) absente : frame-ancestors 'self' ou X-Frame-Options"})
    if csp and ("'unsafe-inline'" in csp and "script-src" in csp and "nonce-" not in csp):
        findings.append({"id": "csp-unsafe-inline", "point": "S11", "gravite": "info", "constat": "CSP autorise 'unsafe-inline' pour les scripts (protection XSS réduite)"})
    for leak in ("x-powered-by", "server"):
        v = lower.get(leak, "")
        if v and any(ch.isdigit() for ch in v):
            findings.append({"id": "version-leak", "point": "S2", "gravite": "info", "constat": f"En-tête {leak} révèle la technologie et sa version : {v}"})

    # Cookies
    cookies = headers.get_all("Set-Cookie") or []
    info["cookies_http"] = []
    for c in cookies:
        name = c.split("=", 1)[0].strip()
        attrs = c.lower()
        flags = {"secure": "; secure" in attrs, "httponly": "; httponly" in attrs, "samesite": "samesite=" in attrs}
        info["cookies_http"].append({"nom": name, **flags})
        missing = [k for k, v in flags.items() if not v and not (k == "secure" and is_local)]
        if missing:
            sev = "haute" if any(t in name.lower() for t in ("sess", "auth", "token", "sid", "jwt")) else "moyenne"
            findings.append({"id": "cookie-flags", "point": "S11", "gravite": sev,
                             "constat": f"Cookie « {name} » sans {', '.join(missing)}"})
        if not any(t in name.lower() for t in ("sess", "csrf", "xsrf", "auth", "token", "sid", "consent", "cookie", "lang", "locale", "cart", "panier", "__host", "__secure", "cf_", "__cf")):
            findings.append({"id": "cookie-first-visit", "point": "10", "gravite": "moyenne",
                             "constat": f"Cookie « {name} » déposé par le serveur dès la première visite : vérifier qu'il est strictement nécessaire"})

    # Hébergeur cité dans les mentions légales
    if not is_local and not no_mentions:
        info["mentions_legales"] = check_mentions(final_url, body_text, mentions, detected, findings)

    if probe_files:
        info["chemins_testes"] = probe(f"{final.scheme}://{final.netloc}", findings)

    return {**info, "constats": findings}


def render(r):
    icon = {"haute": "🔴", "moyenne": "🟠", "info": "🔵"}
    out = [f"# Vérification HTTP — {r['url']}", ""]
    dns = r.get("dns", {})
    out.append(f"Adresse IP réellement contactée : {r.get('ip_contactee') or '?'}"
               + (f" · DNS de l'ordinateur : {', '.join(dns.get('local', [])) or 'aucune'}" if dns else "")
               + (f" · DNS public : {', '.join(dns['public'])}" if dns.get("public") else "")
               + (f" (CNAME {', '.join(dns['cname'])})" if dns.get("cname") else ""))
    if dns.get("public_erreur"):
        out.append(f"DNS public injoignable : {dns['public_erreur']}")
    out.append(f"Hébergeur détecté : {', '.join(r.get('hebergeur_detecte') or []) or 'non reconnu (voir `whois <ip>`)'}")
    if "erreur" in r:
        out += ["", f"❌ {r['erreur']}"]
        for f in r.get("constats", []):
            out.append(f"- {icon[f['gravite']]} [{f['point']}] {f['constat']}")
        return "\n".join(out)
    out += [f"Statut : {r['statut']} · URL finale : {r['url_finale']}", "", "## Constats"]
    if not r["constats"]:
        out.append("✅ Aucun problème détecté.")
    for f in sorted(r["constats"], key=lambda x: {"haute": 0, "moyenne": 1, "info": 2}[x["gravite"]]):
        out.append(f"- {icon[f['gravite']]} [{f['point']}] {f['constat']}")
    if r.get("variantes"):
        out += ["", "## Adresses testées (http, https, avec et sans www)"]
        for v in r["variantes"]:
            if "resultat" in v:
                out.append(f"- {v['url']} → {v['resultat']}")
            else:
                out.append(f"- {'✅' if v['ok'] else '❌'} {v['url']} → {v['premier_statut']}"
                           + (f" vers {v['location']}" if v.get("location") else "") + f" … fin : {v['url_finale']} ({v['statut_final']})")
    m = r.get("mentions_legales")
    if m:
        out += ["", "## Hébergeur dans les mentions légales"]
        if m.get("resultat"):
            out.append(f"- {m.get('url') or ''} {m['resultat']}".strip())
        else:
            out.append(f"- {m['url']} : cite {', '.join(m['hebergeurs_cites']) or 'aucun hébergeur connu'}")
    out += ["", "## En-têtes présents"]
    for k, v in r.get("en_tetes", {}).items():
        out.append(f"- `{k}: {v[:120]}`")
    if r.get("cookies_http"):
        out += ["", "## Cookies posés par le serveur"]
        for c in r["cookies_http"]:
            out.append(f"- {c['nom']} — Secure {'✅' if c['secure'] else '❌'} · HttpOnly {'✅' if c['httponly'] else '❌'} · SameSite {'✅' if c['samesite'] else '❌'}")
    if r.get("chemins_testes"):
        out += ["", "## Chemins testés (--probe-files)", "", "| Chemin | Statut | Durée | Remarque |", "|---|---|---|---|"]
        for c in r["chemins_testes"]:
            out.append(f"| `{c['chemin']}` | {c['statut'] if c['statut'] is not None else '—'} | {c['duree_s']} s | {c['note'] or 'ok'} |")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("url")
    ap.add_argument("--probe-files", action="store_true", help="Tester l'exposition de fichiers sensibles et la réponse aux adresses inconnues")
    ap.add_argument("--resolve-via", metavar="DNS", help="Résoudre avec un DNS public (1.1.1.1 ou 8.8.8.8) et forcer cette IP")
    ap.add_argument("--mentions", metavar="URL", help="URL de la page des mentions légales (sinon cherchée dans l'accueil)")
    ap.add_argument("--no-mentions", action="store_true", help="Ne pas vérifier l'hébergeur cité dans les mentions légales")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    url = a.url if "://" in a.url else "https://" + a.url
    r = check(url, a.probe_files, a.resolve_via, a.mentions, a.no_mentions)
    print(json.dumps(r, ensure_ascii=False, indent=2) if a.json else render(r))
    sys.exit(0)


if __name__ == "__main__":
    main()
