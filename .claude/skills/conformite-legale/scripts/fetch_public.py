#!/usr/bin/env python3
"""Copie locale de ce qu'un visiteur reçoit d'un site (sans accès au code).

Usage :
    python3 fetch_public.py https://exemple.fr [--out dossier] [--max-pages 15]

Télécharge l'accueil, les pages liées utiles à l'audit (mentions légales,
confidentialité, cookies, CGV, CGU, contact, accessibilité, panier, compte…) et les
scripts du même site. On peut ensuite lancer dessus les analyses habituelles :

    python3 scan_trackers.py <dossier>     # traceurs, outil de consentement, pages légales
    python3 audit_static.py <dossier>      # clés visibles, SRI, accessibilité du HTML…

Ce qui n'est pas dans ce que reçoit le visiteur (code serveur, base de données,
contrôle d'accès) reste invisible : ces points sont ❓, jamais ✅.

Politesse : requêtes GET normales, une à la fois, avec une pause ; robots.txt
respecté ; 2 Mo maximum par fichier. Bibliothèque standard uniquement.
"""

import argparse
import hashlib
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import urllib.robotparser

UA = "Mozilla/5.0 (compatible; en-regle-audit/1.5; +https://github.com/aminem2001/en-regle)"
MAX_BYTES = 2_000_000
USEFUL = re.compile(r"mention|legal|l[ée]gal|confidential|privacy|donn[ée]es|cookie|cgv|cgu|conditions|terms|"
                    r"contact|accessibilit|retour|rembours|livraison|panier|cart|checkout|compte|account|login|"
                    r"connexion|inscription|signup|register|tarif|pricing|abonnement|faq|a-propos|about", re.I)
HREF = re.compile(r"""<a\b[^>]*\bhref\s*=\s*["']([^"'#]+)""", re.I)
SCRIPT = re.compile(r"""<script\b[^>]*\bsrc\s*=\s*["']([^"']+)""", re.I)


def get(url, timeout=15):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.geturl(), r.headers.get("Content-Type", ""), r.read(MAX_BYTES)


def local_name(url, kind):
    p = urllib.parse.urlparse(url)
    path = p.path.strip("/") or "index"
    path = re.sub(r"[^\w./-]", "_", path)[:120]
    if kind == "page" and not path.endswith((".html", ".htm")):
        path += ".html"
    if kind == "script" and not path.endswith((".js", ".mjs")):
        path += ".js"
    if p.query:
        root, ext = os.path.splitext(path)
        path = f"{root}_{hashlib.sha1(p.query.encode()).hexdigest()[:6]}{ext}"
    return os.path.join("pages" if kind == "page" else "scripts", p.netloc, path)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("url")
    ap.add_argument("--out", default=None, help="Dossier de sortie (défaut : site-public-<domaine>)")
    ap.add_argument("--max-pages", type=int, default=15)
    ap.add_argument("--pause", type=float, default=0.5, help="Pause entre deux requêtes, en secondes")
    a = ap.parse_args()
    start = a.url if "://" in a.url else "https://" + a.url
    host = urllib.parse.urlparse(start).hostname or ""
    base_host = host[4:] if host.startswith("www.") else host
    out = a.out or f"site-public-{base_host}"
    os.makedirs(out, exist_ok=True)

    # robots.txt lu avec notre propre identité (le lecteur standard est souvent refusé par
    # les protections anti-robots, ce qui fait croire à tort que tout est interdit).
    # Comme Google : fichier absent ou erreur 4xx = aucune restriction.
    robots = urllib.robotparser.RobotFileParser()
    try:
        _, _, _, txt = get(urllib.parse.urljoin(start, "/robots.txt"))
        robots.parse(txt.decode("utf-8", "ignore").splitlines())
    except Exception:
        robots = None

    def allowed(u):
        return robots is None or robots.can_fetch(UA, u)

    def same_site(u):
        h = urllib.parse.urlparse(u).hostname or ""
        return h == base_host or h.endswith("." + base_host)

    queue, seen, scripts, log = [start], set(), {}, []
    pages = 0
    while queue and pages < a.max_pages:
        url = queue.pop(0)
        if url in seen:
            continue
        seen.add(url)
        if not allowed(url):
            log.append({"url": url, "note": "interdit par robots.txt, non téléchargé"})
            continue
        try:
            st, final, ctype, body = get(url)
        except Exception as e:
            log.append({"url": url, "note": f"erreur : {type(e).__name__}"})
            continue
        time.sleep(a.pause)
        if "html" not in ctype.lower():
            continue
        pages += 1
        name = local_name(final, "page")
        os.makedirs(os.path.join(out, os.path.dirname(name)), exist_ok=True)
        open(os.path.join(out, name), "wb").write(body)
        log.append({"url": final, "statut": st, "fichier": name})
        html = body.decode("utf-8", "ignore")
        for src in SCRIPT.findall(html):
            s = urllib.parse.urljoin(final, src)
            scripts.setdefault(s, final)
        links = [urllib.parse.urljoin(final, h) for h in HREF.findall(html)]
        for l in links:
            l = l.split("#")[0]
            if l.startswith("http") and same_site(l) and l not in seen and USEFUL.search(urllib.parse.urlparse(l).path):
                queue.append(l)

    # Scripts : ceux du site (clés, appels d'IA, traceurs intégrés au code) ; les tiers sont listés
    third = []
    for s, page in scripts.items():
        if not same_site(s):
            third.append({"script": s, "page": page})
            continue
        if not allowed(s):
            continue
        try:
            st, final, ctype, body = get(s)
        except Exception as e:
            log.append({"url": s, "note": f"erreur : {type(e).__name__}"})
            continue
        time.sleep(a.pause / 2)
        name = local_name(final, "script")
        os.makedirs(os.path.join(out, os.path.dirname(name)), exist_ok=True)
        open(os.path.join(out, name), "wb").write(body)
        log.append({"url": final, "statut": st, "fichier": name})
    # Les scripts tiers restent visibles pour scan_trackers via ce fichier HTML de synthèse
    os.makedirs(os.path.join(out, "pages"), exist_ok=True)
    with open(os.path.join(out, "pages", "scripts-tiers.html"), "w", encoding="utf-8") as f:
        f.write("<!-- scripts tiers chargés par les pages -->\n" + "\n".join(f'<script src="{t["script"]}"></script>' for t in third) + "\n")
    info = {"site": start, "date": time.strftime("%Y-%m-%d %H:%M"), "pages": pages, "scripts_du_site": len(scripts) - len(third),
            "scripts_tiers": third, "journal": log}
    json.dump(info, open(os.path.join(out, "telechargement.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"# Copie publique de {start} ({info['date']})\n")
    print(f"- {pages} page(s) et {info['scripts_du_site']} script(s) du site enregistrés dans {out}/")
    print(f"- {len(third)} script(s) tiers : " + (", ".join(sorted({urllib.parse.urlparse(t['script']).hostname for t in third})) or "aucun"))
    errors = [l for l in log if l.get("note", "").startswith("erreur")]
    for l in errors[:5]:
        print(f"- ❓ {l['url']} : {l['note']}")
    if not pages:
        print("- ❓ Aucune page reçue : site injoignable, protection anti-robots ou adresse fausse. Tester dans un navigateur.")
    blocked = [l for l in log if "robots" in l.get("note", "")]
    if blocked:
        print(f"- {len(blocked)} adresse(s) non téléchargée(s) : interdites par robots.txt")
    print("\nÀ lancer ensuite :")
    print(f"  python3 scan_trackers.py {out}\n  python3 audit_static.py {out}")
    print("\nRappel : ces fichiers montrent ce que reçoit un visiteur, pas le code du serveur. Ce qui ne s'y voit pas reste ❓.")


if __name__ == "__main__":
    sys.exit(main())
