// Génère les illustrations « avant / après » (SVG) : `node tools/illustrations.mjs`
// Ce sont des dessins d'exemples de projets, pas des photos de chantiers réels.
import { writeFile } from "node:fs/promises";

const W = 800, H = 500;
// Pièce en perspective centrale : mur du fond, plafond, sol, murs latéraux
const BW = { x1: 150, y1: 70, x2: 650, y2: 350 };
const room = (c) => `
  <rect width="${W}" height="${H}" fill="${c.ceil}"/>
  <polygon points="0,0 ${BW.x1},${BW.y1} ${BW.x1},${BW.y2} 0,${H}" fill="${c.side}"/>
  <polygon points="${W},0 ${BW.x2},${BW.y1} ${BW.x2},${BW.y2} ${W},${H}" fill="${c.side2 || c.side}"/>
  <polygon points="0,0 ${W},0 ${BW.x2},${BW.y1} ${BW.x1},${BW.y1}" fill="${c.ceil}"/>
  <rect x="${BW.x1}" y="${BW.y1}" width="${BW.x2 - BW.x1}" height="${BW.y2 - BW.y1}" fill="${c.wall}"/>
  <polygon points="${BW.x1},${BW.y2} ${BW.x2},${BW.y2} ${W},${H} 0,${H}" fill="${c.floor}"/>`;

// Lignes de fuite du sol (lames, carrelage)
const floorLines = (n, color, op = 0.35, w = 1.2) => {
  let s = "";
  for (let i = 0; i <= n; i++) {
    const xb = BW.x1 + ((BW.x2 - BW.x1) * i) / n;
    const xf = (W * i) / n;
    s += `<line x1="${xb}" y1="${BW.y2}" x2="${xf}" y2="${H}" stroke="${color}" stroke-opacity="${op}" stroke-width="${w}"/>`;
  }
  return s;
};
const floorRows = (rows, color, op = 0.35) => {
  let s = "";
  for (let i = 1; i < rows; i++) {
    const t = Math.pow(i / rows, 1.6);
    const y = BW.y2 + (H - BW.y2) * t;
    const xl = BW.x1 * (1 - t), xr = BW.x2 + (W - BW.x2) * t;
    s += `<line x1="${xl}" y1="${y}" x2="${xr}" y2="${y}" stroke="${color}" stroke-opacity="${op}" stroke-width="1.2"/>`;
  }
  return s;
};
const grid = (id, size, bg, line, op = 0.5) =>
  `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${bg}"/><path d="M${size} 0H0V${size}" fill="none" stroke="${line}" stroke-opacity="${op}" stroke-width="1.5"/></pattern>`;
const grain = `<filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .07 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
const svg = (title, defs, body, mood = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">
<title>${title}</title>
<defs>${grain}${defs}</defs>
${body}
${mood}
<rect width="${W}" height="${H}" filter="url(#g)" opacity=".9"/>
</svg>`;
const plant = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-14 0h28l-4 34h-20z" fill="#c9b8a0"/>
  <path d="M0 0C-4-30-30-40-38-30C-26-26-12-18 0 0zM0 0C4-34 26-48 36-38C24-32 10-22 0 0zM0 0C-2-40 6-62 14-66C14-50 6-26 0 0z" fill="#4f7a55"/>
  <path d="M0 0C-18-22-34-22-40-14C-28-14-14-8 0 0z" fill="#6a9a6c"/></g>`;
const bulb = (x, y, len) => `<line x1="${x}" y1="0" x2="${x}" y2="${y + len}" stroke="#3b3b3b" stroke-width="2"/><circle cx="${x}" cy="${y + len + 8}" r="9" fill="#f3e6a8"/><circle cx="${x}" cy="${y + len + 8}" r="40" fill="#f3e6a8" opacity=".12"/>`;
const dim = `<rect width="${W}" height="${H}" fill="#3a2f20" opacity=".16"/>`;
const warm = `<radialGradient id="warm" cx=".5" cy=".25" r=".8"><stop offset="0" stop-color="#fff4dc" stop-opacity=".55"/><stop offset="1" stop-color="#fff4dc" stop-opacity="0"/></radialGradient>`;
const glow = `<rect width="${W}" height="${H}" fill="url(#warm)"/>`;

/* ---------------- Salle de bain ---------------- */
const sdbBefore = svg("Illustration : salle de bain avant rénovation (carrelage daté, baignoire ancienne)",
  grid("t1", 22, "#e9d7a8", "#b59a62") + grid("f1", 34, "#8a5a3a", "#5a3822", 0.6),
  `${room({ ceil: "#d9d0bd", side: "#cdb98a", side2: "#c4ae7d", wall: "#e2d2a6", floor: "#86573a" })}
  <rect x="${BW.x1}" y="170" width="500" height="180" fill="url(#t1)"/>
  ${floorLines(10, "#3f2617", .5)}${floorRows(6, "#3f2617", .5)}
  <!-- baignoire -->
  <rect x="170" y="268" width="250" height="78" rx="18" fill="#f4efe4" stroke="#cfc4ad" stroke-width="3"/>
  <rect x="182" y="276" width="226" height="14" rx="7" fill="#e3dccb"/>
  <path d="M220 300c20 6 40 4 60 10" stroke="#c9b276" stroke-width="5" opacity=".6" fill="none"/>
  <path d="M195 346h12v14h-12zM383 346h12v14h-12z" fill="#b8ab90"/>
  <!-- robinet + rideau -->
  <path d="M182 250h20v10" stroke="#9a9a9a" stroke-width="5" fill="none"/>
  <line x1="165" y1="120" x2="425" y2="120" stroke="#8d8d8d" stroke-width="4"/>
  <path d="M170 122q12 70 0 146h34q-14-76 0-146z" fill="#9bb5a8" opacity=".85"/>
  <!-- lavabo -->
  <rect x="490" y="230" width="110" height="30" rx="6" fill="#f2ede2" stroke="#cfc4ad" stroke-width="3"/>
  <rect x="535" y="260" width="20" height="88" fill="#ece5d5" stroke="#cfc4ad" stroke-width="2"/>
  <rect x="505" y="130" width="80" height="80" fill="#c5d3d6" stroke="#9a8b6a" stroke-width="5"/>
  <!-- fissure, tache -->
  <path d="M600 92l-12 22 8 10-14 26 6 14" stroke="#7a6a4a" stroke-width="2" fill="none"/>
  <ellipse cx="300" cy="105" rx="40" ry="16" fill="#a99a6a" opacity=".35"/>
  ${bulb(400, 0, 40)}`, dim);

const sdbAfter = svg("Illustration : salle de bain après rénovation (douche à l’italienne, grands carreaux, meuble en bois)",
  warm + `<linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#cfe6f2" stop-opacity=".45"/><stop offset="1" stop-color="#ffffff" stop-opacity=".15"/></linearGradient>`
  + grid("t2", 70, "#d9d6cf", "#bdb8ad", .7) + grid("f2", 60, "#bfb9ae", "#9f988b", .6),
  `${room({ ceil: "#f3f1ec", side: "#e2ded5", side2: "#dad6cc", wall: "#ebe8e1", floor: "#c8c1b4" })}
  <rect x="${BW.x1}" y="${BW.y1}" width="250" height="280" fill="url(#t2)"/>
  ${floorLines(7, "#8f877a", .45)}${floorRows(4, "#8f877a", .45)}
  <!-- douche à l'italienne -->
  <rect x="${BW.x1}" y="${BW.y1}" width="250" height="280" fill="#ffffff" opacity=".08"/>
  <line x1="190" y1="112" x2="190" y2="140" stroke="#2b2b2b" stroke-width="4"/>
  <rect x="172" y="104" width="50" height="10" rx="5" fill="#2b2b2b"/>
  <path d="M182 118v60M192 118v70M202 118v62M212 118v56" stroke="#9fc3d9" stroke-width="1.5" opacity=".7"/>
  <rect x="${BW.x1 + 250}" y="${BW.y1}" width="6" height="280" fill="#2b2b2b"/>
  <polygon points="400,70 410,70 410,350 400,350" fill="url(#glass)"/>
  <rect x="300" y="210" width="60" height="24" rx="3" fill="#cfc9bd"/>
  ${plant(330, 210, .5)}
  <!-- meuble vasque bois -->
  <rect x="460" y="236" width="170" height="64" rx="4" fill="#a87a4f"/>
  <path d="M470 268h150" stroke="#8b6239" stroke-width="2"/>
  <rect x="520" y="296" width="6" height="40" fill="#2b2b2b"/><rect x="564" y="296" width="6" height="40" fill="#2b2b2b"/>
  <ellipse cx="545" cy="234" rx="44" ry="10" fill="#fafafa" stroke="#d6d0c4" stroke-width="2"/>
  <path d="M545 210v14h12" stroke="#2b2b2b" stroke-width="4" fill="none"/>
  <!-- miroir rond rétroéclairé -->
  <circle cx="545" cy="150" r="52" fill="#fff4d6" opacity=".55"/>
  <circle cx="545" cy="150" r="44" fill="#d9e6ea" stroke="#2b2b2b" stroke-width="3"/>
  <path d="M520 128l18-18M528 150l30-30" stroke="#fff" stroke-width="3" opacity=".7"/>
  ${plant(620, 228, .55)}
  <!-- spots -->
  <circle cx="300" cy="40" r="6" fill="#fff6dd"/><circle cx="500" cy="40" r="6" fill="#fff6dd"/>`, glow);

/* ---------------- Cuisine ---------------- */
const cuiBefore = svg("Illustration : cuisine avant rénovation (meubles anciens, carrelage à motifs, néon)",
  `<pattern id="flo" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#efe3c4"/><circle cx="15" cy="15" r="7" fill="none" stroke="#c07a3a" stroke-width="2"/><circle cx="15" cy="15" r="2" fill="#7c8f4a"/><path d="M30 0H0V30" fill="none" stroke="#c9b48a"/></pattern>`
  + `<pattern id="chk" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="#d8cdb6"/><rect width="24" height="24" fill="#8f7d5e"/><rect x="24" y="24" width="24" height="24" fill="#8f7d5e"/></pattern>`,
  `${room({ ceil: "#dcd5c5", side: "#cfc3a3", wall: "#ddd1b2", floor: "#b4a483" })}
  <polygon points="${BW.x1},${BW.y2} ${BW.x2},${BW.y2} ${W},${H} 0,${H}" fill="url(#chk)" opacity=".85"/>
  <!-- meubles hauts -->
  <rect x="170" y="100" width="460" height="80" fill="#a35f2c"/>
  ${[0,1,2,3,4].map(i=>`<rect x="${178+i*91}" y="108" width="83" height="64" fill="#b56d34" stroke="#7d4520" stroke-width="2"/><circle cx="${250+i*91}" cy="160" r="3" fill="#d8c08a"/>`).join("")}
  <!-- crédence -->
  <rect x="170" y="180" width="460" height="70" fill="url(#flo)"/>
  <!-- plan + meubles bas -->
  <rect x="160" y="250" width="480" height="14" fill="#d9c79c" stroke="#a8936a"/>
  <rect x="170" y="264" width="460" height="86" fill="#a35f2c"/>
  ${[0,1,2,3,4].map(i=>`<rect x="${178+i*91}" y="272" width="83" height="70" fill="#b56d34" stroke="#7d4520" stroke-width="2"/><circle cx="${250+i*91}" cy="284" r="3" fill="#d8c08a"/>`).join("")}
  <rect x="300" y="244" width="90" height="8" rx="3" fill="#b9b9b9"/>
  <path d="M345 244v-22h12" stroke="#9a9a9a" stroke-width="4" fill="none"/>
  <!-- néon -->
  <rect x="300" y="72" width="200" height="10" rx="4" fill="#f4f8e6"/><rect x="250" y="82" width="300" height="70" fill="#eef5d5" opacity=".18"/>
`, dim);

const cuiAfter = svg("Illustration : cuisine après rénovation (façades bleu nuit, plan clair, suspensions, parquet)",
  warm + `<pattern id="sub" width="40" height="20" patternUnits="userSpaceOnUse"><rect width="40" height="20" fill="#f5f3ee"/><path d="M0 0H40M0 10H40M20 0V10M0 10V20M40 10V20" stroke="#d8d3c8" stroke-width="1.2"/></pattern>`,
  `${room({ ceil: "#f4f2ed", side: "#e7e3da", wall: "#efece5", floor: "#c39a6b" })}
  ${floorLines(14, "#8a6640", .45)}
  <!-- étagère ouverte -->
  <rect x="200" y="120" width="160" height="8" fill="#a87a4f"/>
  <rect x="215" y="98" width="16" height="22" rx="3" fill="#e9e2d2"/><rect x="236" y="92" width="16" height="28" rx="3" fill="#d6cbb4"/><rect x="262" y="104" width="30" height="16" rx="8" fill="#ffffff"/>
  ${plant(330, 120, .45)}
  <!-- meubles hauts bleu nuit -->
  <rect x="420" y="96" width="210" height="88" fill="#16295a"/>
  <path d="M490 96v88M560 96v88" stroke="#0f1f40" stroke-width="3"/>
  <!-- crédence métro -->
  <rect x="170" y="184" width="460" height="66" fill="url(#sub)"/>
  <!-- plan quartz + meubles bas -->
  <rect x="160" y="250" width="480" height="12" fill="#f7f6f2" stroke="#d9d4c8"/>
  <rect x="170" y="262" width="460" height="88" fill="#16295a"/>
  ${[0,1,2,3].map(i=>`<path d="M${170+i*115+115} 262v88" stroke="#0f1f40" stroke-width="3"/><rect x="${170+i*115+38}" y="274" width="40" height="3" rx="1.5" fill="#c9a86a"/>`).join("")}
  <rect x="310" y="245" width="80" height="6" rx="3" fill="#cfd3d8"/>
  <path d="M350 245v-26q0-8 10-8h6" stroke="#2b2b2b" stroke-width="4" fill="none"/>
  <!-- suspensions -->
  ${[300,400,500].map(x=>`<line x1="${x}" y1="0" x2="${x}" y2="40" stroke="#2b2b2b" stroke-width="2"/><path d="M${x-18} 58q18-26 36 0z" fill="#2b2b2b"/><ellipse cx="${x}" cy="60" rx="20" ry="6" fill="#fff1c9"/>`).join("")}`, glow);

/* ---------------- Séjour ---------------- */
const sejBefore = svg("Illustration : séjour avant rénovation (murs défraîchis, moquette usée, fils apparents)",
  ``,
  `${room({ ceil: "#cfcabe", side: "#b9b4a6", wall: "#c4bfb1", floor: "#7d7466" })}
  <ellipse cx="380" cy="430" rx="120" ry="30" fill="#5f574a" opacity=".5"/>
  <ellipse cx="620" cy="400" rx="60" ry="14" fill="#5f574a" opacity=".4"/>
  <!-- fenêtre -->
  <rect x="440" y="110" width="150" height="170" fill="#c9d4d8" stroke="#8f8a7c" stroke-width="8"/>
  <path d="M515 110v170M440 195h150" stroke="#8f8a7c" stroke-width="6"/>
  <!-- taches + papier peint décollé -->
  <ellipse cx="260" cy="130" rx="60" ry="24" fill="#9d9584" opacity=".45"/>
  <path d="M200 220l40-10 10 40-36 12z" fill="#ddd7c7"/><path d="M200 220l40-10-6 12z" fill="#a8a190"/>
  <!-- radiateur ancien -->
  <rect x="200" y="280" width="140" height="60" fill="#a7a293"/>
  ${[0,1,2,3,4,5,6].map(i=>`<rect x="${206+i*19}" y="284" width="12" height="52" rx="5" fill="#bcb7a7"/>`).join("")}
  <!-- fils -->
  <path d="M150 90q60 40 120 0t120 10" stroke="#2f2f2f" stroke-width="3" fill="none"/>
  <rect x="360" y="300" width="24" height="18" fill="#e2dccb" stroke="#8f8a7c"/><path d="M372 318q10 40-30 60" stroke="#2f2f2f" stroke-width="3" fill="none"/>
  ${bulb(300, 0, 70)}`, dim);

const sejAfter = svg("Illustration : séjour après rénovation (mur bleu nuit, parquet en chevrons, éclairage intégré)",
  warm + `<pattern id="herr" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="scale(1 .45)"><rect width="40" height="40" fill="#c9a06c"/><path d="M0 40L20 20L40 40M0 20L20 0L40 20" stroke="#a87f4e" stroke-width="3" fill="none"/></pattern>`,
  `${room({ ceil: "#f4f2ed", side: "#e9e5dc", wall: "#16295a", floor: "#c9a06c" })}
  <polygon points="${BW.x1},${BW.y2} ${BW.x2},${BW.y2} ${W},${H} 0,${H}" fill="url(#herr)"/>
  <!-- fenêtre -->
  <rect x="440" y="110" width="150" height="170" fill="#d6e8f2" stroke="#f4f2ed" stroke-width="8"/>
  <path d="M515 110v170M440 195h150" stroke="#f4f2ed" stroke-width="6"/>
  <path d="M440 280l-60 150h260l-50-150z" fill="#fff4d6" opacity=".18"/>
  <!-- tableau + étagère -->
  <rect x="210" y="120" width="120" height="80" fill="#f4f2ed"/><rect x="220" y="130" width="100" height="60" fill="#3466ff" opacity=".85"/><circle cx="290" cy="150" r="14" fill="#9fb7ff"/>
  <!-- canapé -->
  <rect x="180" y="262" width="220" height="70" rx="14" fill="#e8e2d6"/>
  <rect x="190" y="236" width="200" height="44" rx="12" fill="#efe9de"/>
  <rect x="170" y="258" width="30" height="62" rx="10" fill="#ddd6c8"/><rect x="380" y="258" width="30" height="62" rx="10" fill="#ddd6c8"/>
  <rect x="216" y="244" width="50" height="30" rx="8" fill="#c9a86a"/>
  <rect x="196" y="330" width="6" height="18" fill="#2b2b2b"/><rect x="378" y="330" width="6" height="18" fill="#2b2b2b"/>
  <ellipse cx="290" cy="420" rx="150" ry="34" fill="#efe9de" opacity=".85"/>
  ${plant(610, 312, .8)}
  <!-- spots encastrés -->
  ${[220,330,440,550].map(x=>`<circle cx="${x}" cy="34" r="6" fill="#fff6dd"/><path d="M${x-10} 38l-30 40h80l-30-40z" fill="#fff6dd" opacity=".08"/>`).join("")}`, glow);

const out = "src/assets/img/illus/";
for (const [n, s] of Object.entries({ "sdb-avant": sdbBefore, "sdb-apres": sdbAfter, "cuisine-avant": cuiBefore, "cuisine-apres": cuiAfter, "sejour-avant": sejBefore, "sejour-apres": sejAfter })) {
  await writeFile(out + n + ".svg", s);
}
console.log("✓ 6 illustrations générées");
