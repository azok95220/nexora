#!/usr/bin/env python3
"""Vérifie qu'un rapport CONFORMITE.md (format En règle 1.4) tombe juste.

Usage :
    python3 check_report.py [CONFORMITE.md] [--points 52]

Contrôles :
- dans « Le détail », chaque point a une ligne qui commence par ✅ 🟠 ❌ ❓ ou ➖ ;
- le nombre de lignes par statut est égal aux totaux de la phrase « Sur N points
  contrôlés » et du tableau « En bref » (catégorie par catégorie) ;
- le total fait bien le nombre de points de la grille (52, ou 59 pour une appli mobile) ;
- le tableau « À faire » est numéroté sans trou, et les « action N » citées existent ;
- aucun ✅ ou ➖ ne renvoie à une action, et chaque 🟠 ❌ ❓ dit quoi faire ;
- pas de jargon dans la partie principale (sigles, numéros de points, articles de
  loi, chemins de fichiers) : simple avertissement, à corriger ou à expliquer.

Bibliothèque standard uniquement. Code de sortie 1 s'il y a une erreur.
"""

import argparse
import re
import sys
import unicodedata

STATUSES = ["✅", "🟠", "❌", "❓", "➖"]
WORDS = {"✅": r"bons?", "🟠": r"moyens?", "❌": r"pas bons?", "❓": r"(?:à|a) v[ée]rifier", "➖": r"pas concern[ée]s?"}
JARGON = [
    (r"\bOWASP\b", "OWASP"), (r"\bCSP\b", "CSP"), (r"\bHSTS\b", "HSTS"), (r"\bXSS\b", "XSS"),
    (r"\bSSRF\b", "SSRF"), (r"\bCSRF\b", "CSRF"), (r"\bCORS\b", "CORS"), (r"\bSRI\b", "SRI"),
    (r"\bLCEN\b", "LCEN"), (r"\bRGAA\b", "RGAA"), (r"\bWCAG\b", "WCAG"), (r"\bBOLA\b", "BOLA"),
    (r"(?<!\()\bDPA\b(?!\))", "DPA sans explication"), (r"\bA(?:0[1-9]|10)\b", "numéro OWASP"),
    (r"\bS(?:1[0-5]|[1-9])\b", "numéro de point"), (r"\bart(?:icle)?\.? ?\d", "article de loi"),
    (r"\b[LRD]\d{3}-\d", "article de code"), (r"\b[\w/-]+\.(?:tsx?|jsx?|mjs|py|php|rb|vue|svelte)\b", "chemin de fichier"),
]


def norm(s):
    s = "".join(ch for ch in s if unicodedata.category(ch)[0] in "LNZ" or ch in "'’-")
    return re.sub(r"\s+", " ", s).strip().lower()


def section(text, title_re):
    m = re.search(r"^## [^\n]*" + title_re + r"[^\n]*\n", text, re.M | re.I)
    if not m:
        return None
    end = re.search(r"^(## |<details)", text[m.end():], re.M)
    return text[m.end(): m.end() + end.start()] if end else text[m.end():]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("rapport", nargs="?", default="CONFORMITE.md")
    ap.add_argument("--points", type=int, default=0, help="Nombre de points de la grille (par défaut : 52, ou 59 avec la catégorie « Appli mobile »)")
    a = ap.parse_args()
    try:
        text = open(a.rapport, encoding="utf-8").read()
    except OSError as e:
        print(f"❌ Rapport illisible : {e}")
        sys.exit(1)

    errors, warnings = [], []

    # 1. Le détail
    detail = section(text, r"d[ée]tail")
    if detail is None:
        print("❌ Section « Le détail » introuvable (titre « ## 📋 Le détail, point par point »).")
        sys.exit(1)
    cats, current, lines = {}, None, []
    for raw in detail.splitlines():
        if raw.startswith("### "):
            current = raw[4:].strip()
            cats[current] = {s: 0 for s in STATUSES}
            continue
        m = re.match(r"^\s*[-*]\s+(✅|🟠|❌|❓|➖)", raw)
        if m and current:
            cats[current][m.group(1)] += 1
            lines.append((current, m.group(1), raw))
        elif re.match(r"^\s*[-*]\s+\S", raw) and current:
            errors.append(f"Ligne sans statut dans « {current} » : {raw.strip()[:80]}")
    if not a.points:
        a.points = 59 if any("appli" in norm(c) for c in cats) else 52
    totals = {s: sum(c[s] for c in cats.values()) for s in STATUSES}
    total = sum(totals.values())
    if total != a.points:
        errors.append(f"« Le détail » compte {total} points au lieu de {a.points}.")

    # 2. Phrase « Sur N points contrôlés »
    bref = section(text, r"en bref") or ""
    m = re.search(r"Sur (\d+) points", bref)
    if not m:
        errors.append("Phrase « Sur N points contrôlés : … » introuvable dans « En bref ».")
    else:
        if int(m.group(1)) != total:
            errors.append(f"« Sur {m.group(1)} points » mais « Le détail » en compte {total}.")
        line = bref[m.start(): bref.find("\n", m.start())]
        for s in STATUSES:
            mm = re.search(r"(\d+)\s*\**\s*" + WORDS[s], line, re.I)
            n = int(mm.group(1)) if mm else 0
            if n != totals[s]:
                errors.append(f"Total {s} : « En bref » dit {n}, « Le détail » compte {totals[s]}.")

    # 3. Tableau par catégorie
    rows = {}
    for raw in bref.splitlines():
        cells = [c.strip() for c in raw.strip().strip("|").split("|")]
        if len(cells) >= 2 and raw.strip().startswith("|") and not set(cells[0]) <= set("-: "):
            rows[norm(cells[0])] = cells[1]
    for name, counts in cats.items():
        cell = rows.get(norm(name))
        if cell is None:
            errors.append(f"Catégorie « {name} » absente du tableau « En bref ».")
            continue
        for s in STATUSES:
            mm = re.search(re.escape(s) + r"\s*(\d+)", cell)
            n = int(mm.group(1)) if mm else 0
            if s == "➖" and not mm and "➖" in cell and counts[s] and not any(counts[x] for x in STATUSES if x != "➖"):
                n = counts[s]  # « ➖ pas concerné » pour toute la catégorie
            if n != counts[s]:
                errors.append(f"« {name} » : le tableau dit {s} {n}, le détail en compte {counts[s]}.")

    # 4. Tableau À faire
    todo = section(text, r"(?:à|a) faire") or ""
    nums = [int(x) for x in re.findall(r"^\|\s*(\d+)\s*\|", todo, re.M)]
    if nums and nums != list(range(1, len(nums) + 1)):
        errors.append(f"Numérotation de « À faire » non continue : {nums}.")
    cited = {int(x) for x in re.findall(r"\bactions? (\d+)", detail, re.I)}
    for n in sorted(cited - set(nums)):
        errors.append(f"« action {n} » citée dans le détail mais absente de « À faire ».")
    for cat, st, raw in lines:
        has_action = bool(re.search(r"\baction \d+", raw, re.I))
        if st in ("✅", "➖") and has_action:
            errors.append(f"Point {st} qui renvoie à une action (« {cat} ») : {raw.strip()[:80]}")
        if st in ("🟠", "❌", "❓") and not (has_action or "→" in raw):
            warnings.append(f"Point {st} sans « → quoi faire » (« {cat} ») : {raw.strip()[:80]}")

    # 5. Jargon dans la partie principale
    main_part = text.split("<details", 1)[0]
    main_part = re.sub(r"`[^`\n]*`", "", main_part)  # le code entre accents graves est assumé
    seen = set()
    for pat, label in JARGON:
        for mm in re.finditer(pat, main_part):
            key = (label, mm.group(0))
            if key not in seen:
                seen.add(key)
                warnings.append(f"Jargon dans la partie principale ({label}) : « {mm.group(0)} » → l'expliquer ou le déplacer dans les détails techniques.")

    print(f"# Vérification du rapport — {a.rapport}\n")
    print("Le détail : " + " · ".join(f"{s} {totals[s]}" for s in STATUSES) + f" = {total} points")
    for name, c in cats.items():
        print(f"- {name} : " + " · ".join(f"{s} {c[s]}" for s in STATUSES if c[s]))
    print(f"À faire : {len(nums)} ligne(s)\n")
    for e in errors:
        print(f"❌ {e}")
    for w in warnings:
        print(f"🟠 {w}")
    if not errors and not warnings:
        print("✅ Les totaux tombent juste, la numérotation est continue, pas de jargon repéré.")
    elif not errors:
        print("✅ Les totaux tombent juste (voir les remarques 🟠 ci-dessus).")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
