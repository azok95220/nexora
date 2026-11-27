#!/usr/bin/env python3
"""Vérifie l'e-mail d'un domaine : réception (MX), signatures (SPF, DKIM, DMARC)
et service de redirection éventuel (sous-traitant à citer dans la politique).

Usage :
    python3 check_email.py <domaine> [adresse@domaine …] [--textes textes-visibles.md]
                           [--selecteur nom] [--doh] [--json]

- Les adresses affichées sur le site peuvent être données à la main ou extraites
  d'un fichier (--textes, par exemple la sortie de extract_texts.py) : chaque
  domaine d'adresse est contrôlé (MX présents ?).
- DNS : utilise `dig` s'il est installé, sinon DNS sur HTTPS (cloudflare-dns.com),
  ou DNS sur HTTPS d'office avec --doh (envoie les noms au résolveur public).
- Ne remplace pas un vrai test : tant qu'un message envoyé à l'adresse de contact
  n'a pas été reçu (spams compris), le point « l'adresse de contact reçoit bien »
  reste ❓.

Bibliothèque standard uniquement. Aucune donnée n'est envoyée au site testé.
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request

UA = "conformite-legale-check/1.4"
DKIM_SELECTORS = ["resend", "google", "default", "selector1", "selector2", "k1", "k2", "s1", "s2", "mail", "dkim",
                  "cf2024-1", "mandrill", "mailjet", "sendgrid", "smtpapi", "pm", "postmark", "brevo", "mail1",
                  "ovh", "ovhmo", "protonmail", "protonmail2", "zoho", "zmail", "fm1", "fm2", "mxvault", "everlytickey1",
                  "amazonses", "dk", "smtp", "x"]
TYPE_CODES = {"A": 1, "CNAME": 5, "MX": 15, "TXT": 16}
# Services de réception : (motif sur le nom du MX, nom lisible, est une redirection ?)
MX_SERVICES = [
    (r"\.mx\.cloudflare\.net$", "Cloudflare Email Routing", True),
    (r"registrar-servers\.com$", "Namecheap (redirection d'e-mails)", True),
    (r"improvmx\.com$", "ImprovMX (redirection)", True),
    (r"forwardemail\.net$", "Forward Email (redirection)", True),
    (r"mailgun\.org$", "Mailgun (routage)", True),
    (r"(aspmx\.l\.google\.com|googlemail\.com|smtp\.google\.com)$", "Google (Workspace ou Gmail)", False),
    (r"mail\.protection\.outlook\.com$", "Microsoft 365", False),
    (r"(ovh\.net|ovh\.ca|mail\.ovh)", "OVHcloud", False),
    (r"zoho\.(com|eu)$", "Zoho Mail", False),
    (r"protonmail\.ch$", "Proton Mail", False),
    (r"(ionos\.\w+|kundenserver\.de)$", "IONOS", False),
    (r"gandi\.net$", "Gandi", False),
    (r"infomaniak\.ch$", "Infomaniak", False),
    (r"hostinger\.\w+$", "Hostinger", False),
    (r"messagingengine\.com$", "Fastmail", False),
    (r"icloud\.com$", "iCloud+", False),
    (r"amazonaws\.com$", "Amazon SES", False),
]
SPF_SENDERS = [
    (r"_spf\.google\.com", "Google"), (r"spf\.protection\.outlook\.com", "Microsoft 365"),
    (r"amazonses\.com", "Amazon SES (Resend et autres)"), (r"_spf\.mx\.cloudflare\.net", "Cloudflare"),
    (r"spf\.brevo\.com|sendinblue", "Brevo"), (r"sendgrid\.net", "SendGrid"), (r"mailgun\.org", "Mailgun"),
    (r"spf\.mtasv\.net", "Postmark"), (r"mcsv\.net|mandrillapp", "Mailchimp / Mandrill"), (r"ovh", "OVHcloud"),
    (r"zoho", "Zoho"), (r"protonmail", "Proton"), (r"registrar-servers\.com", "Namecheap"),
]
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


class Resolver:
    def __init__(self, force_doh=False):
        self.use_dig = bool(shutil.which("dig")) and not force_doh
        self.method = "dig" if self.use_dig else "DNS sur HTTPS (cloudflare-dns.com)"

    def query(self, name, rtype):
        """Renvoie la liste des réponses du type demandé (texte), CNAME suivis."""
        if self.use_dig:
            try:
                out = subprocess.run(["dig", "+short", "+time=5", "+tries=2", rtype, name],
                                     capture_output=True, text=True, timeout=20).stdout
            except (subprocess.SubprocessError, OSError):
                out = ""
            lines = [l.strip() for l in out.splitlines() if l.strip() and not l.startswith(";")]
            if rtype == "TXT":
                return ["".join(re.findall(r'"((?:[^"\\]|\\.)*)"', l)) for l in lines if l.startswith('"')]
            if rtype == "MX":
                return [l for l in lines if re.match(r"^\d+\s", l)]
            return lines
        url = f"https://cloudflare-dns.com/dns-query?name={urllib.parse.quote(name)}&type={rtype}"
        req = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.load(r)
        except Exception:
            return []
        res = []
        for a in data.get("Answer", []):
            if a.get("type") != TYPE_CODES[rtype]:
                continue
            d = a.get("data", "")
            if rtype == "TXT":
                d = "".join(re.findall(r'"((?:[^"\\]|\\.)*)"', d)) or d.strip('"')
            res.append(d)
        return res


def mx_service(host):
    for pat, name, fwd in MX_SERVICES:
        if re.search(pat, host, re.I):
            return name, fwd
    return None, False


def check_domain(domain, r, selectors):
    findings, info = [], {"domaine": domain}

    # DNS joignable ? Sans réponse du tout, « pas de MX » serait une fausse alerte
    if not r.query(domain, "NS") and not r.query(domain, "A") and not r.query(domain, "MX"):
        findings.append({"id": "dns-unreachable", "point": "E1", "statut": "❓", "constat": f"Aucune réponse DNS pour {domain} (domaine inexistant, faute de frappe ou DNS injoignable) : relancer avec --doh, puis vérifier l'orthographe."})
        return info, findings

    # MX
    mx = []
    for line in r.query(domain, "MX"):
        parts = line.split()
        if len(parts) >= 2:
            mx.append((int(parts[0]), parts[1].rstrip(".")))
    mx.sort()
    info["mx"] = [f"{p} {h}" for p, h in mx]
    services = []
    for _, h in mx:
        name, fwd = mx_service(h)
        if name and (name, fwd) not in services:
            services.append((name, fwd))
    info["service_reception"] = [n for n, _ in services]
    if not mx:
        findings.append({"id": "e1-no-mx", "point": "E1", "statut": "❌", "constat": f"Aucun serveur de réception (MX) pour {domain} : une adresse @{domain} affichée sur le site ne reçoit rien."})
    elif len(mx) == 1 and mx[0][1] in ("", "."):
        findings.append({"id": "e1-null-mx", "point": "E1", "statut": "❌", "constat": f"MX « nul » pour {domain} : le domaine refuse tout e-mail."})
    else:
        findings.append({"id": "e1-mx-ok", "point": "E1", "statut": "❓", "constat": f"Serveurs de réception présents ({', '.join(h for _, h in mx[:3])}). À confirmer par un vrai message envoyé à l'adresse de contact et reçu (spams compris)."})
    for name, fwd in services:
        if fwd:
            findings.append({"id": "mx-forward", "point": "H2/17", "statut": "🟠", "constat": f"Les e-mails passent par un service de redirection : {name}. C'est un destinataire des données : le citer dans la politique de confidentialité, et identifier la boîte de réception finale (Gmail, Outlook…) qui en est un autre."})

    # SPF
    txt = r.query(domain, "TXT")
    spf = [t for t in txt if t.lower().startswith("v=spf1")]
    info["spf"] = spf
    if not spf:
        findings.append({"id": "spf-none", "point": "E2", "statut": "🟠", "constat": "Pas d'enregistrement SPF : n'importe qui peut envoyer des e-mails « de » ce domaine, et les vôtres risquent les spams."})
    elif len(spf) > 1:
        findings.append({"id": "spf-multi", "point": "E2", "statut": "❌", "constat": f"{len(spf)} enregistrements SPF : il en faut un seul (sinon SPF est invalide). Les fusionner."})
    else:
        s = spf[0].lower()
        if re.search(r"(^|\s)\+all\b", s):
            findings.append({"id": "spf-plusall", "point": "E2", "statut": "❌", "constat": "SPF se termine par « +all » : il autorise le monde entier à envoyer en votre nom."})
        elif re.search(r"(^|\s)\?all\b", s) or not re.search(r"(^|\s)[~-]all\b|redirect=", s):
            findings.append({"id": "spf-weak", "point": "E2", "statut": "🟠", "constat": "SPF sans « ~all » ni « -all » final : il ne protège pas vraiment."})
        lookups = len(re.findall(r"(?:^|\s)[+?~-]?(?:include:|a\b|a:|mx\b|mx:|ptr|exists:|redirect=)", s))
        if lookups > 10:
            findings.append({"id": "spf-lookups", "point": "E2", "statut": "🟠", "constat": f"SPF avec {lookups} recherches DNS directes (limite : 10) : il risque d'être ignoré."})
        senders = [n for pat, n in SPF_SENDERS if re.search(pat, s)]
        info["spf_expediteurs"] = senders
    # DMARC
    dmarc = [t for t in r.query("_dmarc." + domain, "TXT") if t.lower().startswith("v=dmarc1")]
    info["dmarc"] = dmarc
    if not dmarc:
        findings.append({"id": "dmarc-none", "point": "E2", "statut": "🟠", "constat": "Pas de DMARC : ajouter `_dmarc` avec « v=DMARC1; p=none; rua=mailto:… » pour commencer, puis « quarantine » quand tout est aligné. Gmail et Yahoo l'exigent des gros expéditeurs."})
    else:
        m = re.search(r"\bp=(\w+)", dmarc[0], re.I)
        pol = (m.group(1).lower() if m else "?")
        info["dmarc_politique"] = pol
        if len(dmarc) > 1:
            findings.append({"id": "dmarc-multi", "point": "E2", "statut": "❌", "constat": "Plusieurs enregistrements DMARC : il en faut un seul."})
        if pol == "none":
            findings.append({"id": "dmarc-pnone", "point": "E2", "statut": "🔵", "constat": "DMARC en « p=none » (observation) : normal au début ; passer à « quarantine » quand les rapports montrent que tout est aligné."})
    # DKIM
    found = {}
    for sel in selectors:
        recs = [t for t in r.query(f"{sel}._domainkey.{domain}", "TXT") if re.search(r"(^|;)\s*p=[A-Za-z0-9+/=]{20,}", t)]  # « p= » vide = clé révoquée
        if recs:
            found[sel] = recs[0][:60] + ("…" if len(recs[0]) > 60 else "")
    info["dkim"] = found
    # Resend (et d'autres) envoient depuis un sous-domaine « send. » : son SPF doit exister
    if "resend" in found:
        sub = [t for t in r.query("send." + domain, "TXT") if t.lower().startswith("v=spf1")]
        info["spf_send"] = sub
        if not sub:
            findings.append({"id": "dkim-resend-spf", "point": "E2", "statut": "🟠", "constat": f"Clé DKIM Resend trouvée, mais pas de SPF sur send.{domain} : vérifier le domaine dans Resend (Domains) et ajouter les enregistrements demandés."})
    if not found:
        findings.append({"id": "dkim-none", "point": "E2", "statut": "❓", "constat": f"Aucune clé DKIM trouvée avec les sélecteurs courants ({len(selectors)} testés). Si le site envoie des e-mails, demander le sélecteur au service d'envoi (--selecteur nom) ; sans DKIM, les e-mails partent souvent en spam."})
    return info, findings


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("domaine")
    ap.add_argument("adresses", nargs="*", help="Adresses affichées sur le site")
    ap.add_argument("--textes", help="Fichier où chercher les adresses affichées (ex. textes-visibles.md)")
    ap.add_argument("--selecteur", action="append", default=[], help="Sélecteur DKIM à tester en plus")
    ap.add_argument("--doh", action="store_true", help="Utiliser DNS sur HTTPS au lieu de dig")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    domain = re.sub(r"^https?://", "", a.domaine).split("/")[0].lower()
    domain = domain[4:] if domain.startswith("www.") else domain
    addrs = {x.lower() for x in a.adresses}
    if a.textes:
        try:
            addrs |= {m.lower() for m in EMAIL_RE.findall(open(a.textes, encoding="utf-8", errors="ignore").read())}
        except OSError as e:
            print(f"Fichier illisible : {e}", file=sys.stderr)
    addrs = {x for x in addrs if not re.search(r"@(example\.|exemple\.|domaine\.|test\.|email\.com$)", x)}
    domains = [domain] + sorted({x.split("@", 1)[1] for x in addrs} - {domain})

    r = Resolver(a.doh)
    results = []
    for d in domains:
        info, findings = check_domain(d, r, DKIM_SELECTORS + a.selecteur)
        info["adresses_affichees"] = sorted(x for x in addrs if x.endswith("@" + d))
        results.append({**info, "constats": findings})
    out = {"methode_dns": r.method, "domaines": results}

    if a.json:
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return
    print(f"# Vérification e-mail — {domain}\n\nDNS interrogé avec : {r.method}\n")
    for res in results:
        print(f"## {res['domaine']}" + (f" — adresses affichées : {', '.join(res['adresses_affichees'])}" if res["adresses_affichees"] else ""))
        print(f"- Réception (MX) : {', '.join(res['mx']) or 'aucun'}" + (f" → {', '.join(res['service_reception'])}" if res["service_reception"] else ""))
        print(f"- SPF : {res['spf'][0] if res['spf'] else 'absent'}" + (f" (expéditeurs autorisés : {', '.join(res.get('spf_expediteurs', []))})" if res.get("spf_expediteurs") else ""))
        print(f"- DKIM : {', '.join(res['dkim']) if res['dkim'] else 'aucun sélecteur courant trouvé'}")
        print(f"- DMARC : {res['dmarc'][0] if res['dmarc'] else 'absent'}")
        print("\n### Constats")
        for f in res["constats"]:
            print(f"- {f['statut']} [{f['point']}] {f['constat']}")
        print()
    print("Rappel : faire envoyer un vrai message à l'adresse de contact (et une demande par le formulaire) et confirmer la réception, spams compris. "
          "Si plus rien n'arrive alors que tout est bon ici : regarder la liste de blocage du service d'envoi (Resend > Suppressions, Brevo, Postmark, SendGrid).")


if __name__ == "__main__":
    main()
