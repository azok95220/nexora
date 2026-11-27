#!/usr/bin/env python3
"""Calcule le contraste WCAG entre deux couleurs et propose une couleur proche
conforme si besoin.

Usage :
    python3 contrast.py <couleur_texte> <couleur_fond> [--large] [--ui]

Couleurs : #rgb, #rrggbb, rgb(r,g,b) ou noms CSS courants.
Seuils WCAG 2.1 AA : 4,5:1 texte normal ; 3:1 grand texte (≥ 24 px, ou ≥ 18,66 px
en gras) et composants d'interface (--ui).
"""

import argparse
import colorsys
import re
import sys

NAMES = {
    "white": "#ffffff", "black": "#000000", "gray": "#808080", "grey": "#808080",
    "silver": "#c0c0c0", "red": "#ff0000", "green": "#008000", "blue": "#0000ff",
    "yellow": "#ffff00", "orange": "#ffa500", "purple": "#800080", "navy": "#000080",
    "teal": "#008080", "lightgray": "#d3d3d3", "lightgrey": "#d3d3d3", "darkgray": "#a9a9a9",
}


def parse(c):
    c = c.strip().lower()
    c = NAMES.get(c, c)
    m = re.fullmatch(r"#([0-9a-f]{3}|[0-9a-f]{6})", c)
    if m:
        h = m.group(1)
        if len(h) == 3:
            h = "".join(ch * 2 for ch in h)
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    m = re.fullmatch(r"rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+).*\)", c)
    if m:
        return tuple(int(m.group(i)) for i in (1, 2, 3))
    raise ValueError(f"Couleur non reconnue : {c}")


def lum(rgb):
    def ch(v):
        v = v / 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def to_hex(rgb):
    return "#" + "".join(f"{max(0, min(255, round(v))):02x}" for v in rgb)


def suggest(fg, bg, target):
    """Ajuste la luminosité du texte (teinte conservée) jusqu'au seuil."""
    h, l, s = colorsys.rgb_to_hls(*(v / 255 for v in fg))
    darker = lum(bg) > 0.18  # fond clair -> assombrir le texte
    step = -0.01 if darker else 0.01
    while 0 <= l <= 1:
        cand = tuple(v * 255 for v in colorsys.hls_to_rgb(h, l, s))
        if ratio(cand, bg) >= target:
            return to_hex(cand)
        l += step
    return "#000000" if darker else "#ffffff"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("fg")
    ap.add_argument("bg")
    ap.add_argument("--large", action="store_true", help="Grand texte (seuil 3:1)")
    ap.add_argument("--ui", action="store_true", help="Composant d'interface ou icône (seuil 3:1)")
    a = ap.parse_args()
    try:
        fg, bg = parse(a.fg), parse(a.bg)
    except ValueError as e:
        print(e, file=sys.stderr)
        sys.exit(1)
    target = 3.0 if (a.large or a.ui) else 4.5
    r = ratio(fg, bg)
    ok = r >= target
    print(f"Contraste {to_hex(fg)} sur {to_hex(bg)} : {r:.2f}:1 — seuil {target}:1 — {'✅ conforme' if ok else '❌ insuffisant'}")
    if not ok:
        print(f"Suggestion (même teinte) : texte {suggest(fg, bg, target)}")
    sys.exit(0 if ok else 2)


if __name__ == "__main__":
    main()
