#!/usr/bin/env python3
"""Inventaire de tous les textes visibles par l'utilisateur, pour la lecture intégrale.

Liste, fichier par fichier et ligne par ligne, les phrases affichées (textes JSX/HTML/Vue,
chaînes des fichiers de traduction, attributs alt/title/aria-label/placeholder, métadonnées).
But : qu'aucune phrase du site n'échappe à la relecture juridique (allégations, promesses,
mentions obligatoires, cohérence avec les traitements réels).

Usage : python3 extract_texts.py <projet> [--out textes.md] [--min-words 2]
Aucune dépendance (Python 3.8+).
"""
import argparse
import os
import re
import sys

SKIP_DIRS = {"node_modules", ".git", ".next", "dist", "build", "out", ".nuxt", ".svelte-kit", ".output",
             "vendor", "coverage", ".turbo", ".vercel", "Pods", ".dart_tool", "__pycache__", "venv", ".venv",
             "target", "bin", "obj", "_build", "deps", "wp-admin", "wp-includes", "storage", "tmp", "migrations", "tests", "test", "spec"}
EXTS = {".tsx", ".jsx", ".ts", ".js", ".mjs", ".vue", ".svelte", ".astro", ".html", ".htm", ".php", ".twig",
        ".hbs", ".ejs", ".njk", ".liquid", ".md", ".mdx", ".json", ".yml", ".yaml", ".po", ".arb", ".strings", ".xml",
        ".cshtml", ".razor", ".resx", ".aspx", ".jsp", ".ftl", ".vm", ".jinja", ".jinja2", ".j2", ".tpl", ".mustache",
        ".handlebars", ".erb", ".eex", ".heex", ".slim", ".haml", ".latte", ".phtml", ".gohtml", ".tmpl", ".properties",
        ".py", ".rb", ".ex", ".java", ".kt", ".swift", ".dart", ".cs", ".go", ".xliff", ".xlf", ".ini", ".toml", ".marko"}
SKIP_FILES = {"package.json", "package-lock.json", "tsconfig.json", "composer.json", "composer.lock", "yarn.lock",
              "pnpm-lock.yaml", "manifest.json", ".eslintrc.json"}

# Chaîne entre guillemets contenant au moins une lettre et une espace (phrase), ou texte entre balises
DQ_STRING = re.compile(r"""(["`])((?:(?!\1)[^\\\n]|\\.){3,600}?)\1""")
# Guillemet simple : seulement s'il n'est pas collé à une lettre (pas une apostrophe)
SQ_STRING = re.compile(r"""(?<![A-Za-zÀ-ÿ])'((?:[^'\\\n]|\\.){3,600}?)'(?![A-Za-zÀ-ÿ])""")
JSX_TEXT = re.compile(r">\s*([^<>{}\n][^<>{}]{2,600}?)\s*<")
ATTR = re.compile(r"""\b(alt|title|aria-label|placeholder|content|label)\s*=\s*["']([^"']{3,300})["']""", re.I)
LETTERS = re.compile(r"[A-Za-zÀ-ÿ]")
CODEISH = re.compile(r"^use (?:server|client|strict)$|\)\s*:|=>|^npm |^npx |^yarn |^pnpm |^[\w.\-/:#@?=&%+*$|\\^~<>()\[\]{}]*$|^(https?:|mailto:|tel:|/|\.|#|\$|@)|className|\b(import|export|const|function|return)\b|[{};]\s*$")
CLASS_TOKEN = re.compile(r"^[!a-z0-9\-:/\[\].%#()&>*_]+$")


def looks_like_classes(s):
    """Liste de classes CSS (Tailwind…) : tokens en minuscules dont au moins la moitié ont - : [ ou /."""
    toks = s.split()
    if not toks or not all(CLASS_TOKEN.match(t) for t in toks):
        return False
    return sum(1 for t in toks if re.search(r"[-:\[/]", t)) * 2 >= len(toks)


def is_human_text(s, min_words):
    s = s.strip()
    if not LETTERS.search(s) or len(s.split()) < min_words:
        return False
    if CODEISH.search(s) or looks_like_classes(s):
        return False
    return True


def scan(root, min_words):
    out = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for name in sorted(filenames):
            ext = os.path.splitext(name)[1].lower()
            if name.lower() in {"conformite.md", "crash-test.md", "couverture.md", "textes-visibles.md", "readme.md",
                                "changelog.md", "contributing.md", "license.md", "security.md", "audit.md"}:
                continue
            if ext not in EXTS or name in SKIP_FILES or name.endswith((".min.js", ".d.ts", ".test.ts", ".spec.ts", ".config.js", ".config.ts", ".config.mjs")):
                continue
            path = os.path.join(dirpath, name)
            rel = os.path.relpath(path, root).replace(os.sep, "/")
            try:
                if os.path.getsize(path) > 1_500_000:
                    continue
                lines = open(path, encoding="utf-8", errors="ignore").read().splitlines()
            except OSError:
                continue
            seen = set()
            for i, line in enumerate(lines, 1):
                found = []
                for m in ATTR.finditer(line):
                    found.append(f"[{m.group(1)}] {m.group(2)}")
                for m in JSX_TEXT.finditer(line):
                    found.append(m.group(1))
                # Chaînes entre " et ` d'abord, puis on les masque : sinon les apostrophes
                # françaises (l'accueil, d'un…) seraient prises pour des guillemets simples.
                rest = line
                for m in DQ_STRING.finditer(line):
                    found.append(m.group(2))
                    rest = rest.replace(m.group(0), " " * len(m.group(0)), 1)
                for m in SQ_STRING.finditer(rest):
                    found.append(m.group(1))
                for t in found:
                    t = " ".join(t.split())
                    if is_human_text(t, min_words) and (t not in seen):
                        seen.add(t)
                        out.append((rel, i, t))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("projet")
    ap.add_argument("--out", default=None, help="Fichier Markdown de sortie (sinon : sortie standard)")
    ap.add_argument("--min-words", type=int, default=2)
    a = ap.parse_args()
    items = scan(a.projet, a.min_words)
    files = {}
    for rel, i, t in items:
        files.setdefault(rel, []).append((i, t))
    md = [f"# Textes visibles — {os.path.abspath(a.projet)}", "",
          f"{len(items)} textes dans {len(files)} fichiers. Relire **chaque ligne** : allégations, promesses, "
          "mentions obligatoires, cohérence avec les traitements réels, accessibilité du libellé.", ""]
    for rel in sorted(files):
        md.append(f"## {rel}")
        for i, t in files[rel]:
            md.append(f"- L{i} : {t}")
        md.append("")
    text = "\n".join(md)
    if a.out:
        open(a.out, "w", encoding="utf-8").write(text)
        print(f"{len(items)} textes dans {len(files)} fichiers → {a.out}")
    else:
        sys.stdout.write(text)


if __name__ == "__main__":
    main()
