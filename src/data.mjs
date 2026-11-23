// Contenu central du site : modifiez ici le téléphone, les métiers ou les zones,
// puis relancez `node build.mjs`.

export const site = {
  name: "Nexora Travaux",
  url: "https://nexoratravaux.fr",
  tagline: "Votre projet, bien entouré",
  phone: "+33605572482",
  phoneDisplay: "06 05 57 24 82",
  whatsapp: "https://wa.me/33605572482",
  email: "contact@nexoratravaux.fr",
  // Identité légale de l'éditeur (mentions légales, confidentialité)
  legal: {
    owner: "Yanis Hadjour",
    form: "Entrepreneur individuel (EI), micro-entreprise",
    siret: "", // à renseigner dès réception
    address: "59, rue de Ponthieu, Bureau 326, 75008 Paris",
    addressNote: "adresse de domiciliation, Source SAS – ma-domiciliation.fr",
  },
  description:
    "Un seul contact pour vos travaux : Nexora Travaux sélectionne les bons professionnels, négocie les prix et suit votre chantier du début à la fin. Électricité, plomberie, peinture, sols… à Paris et dans toute l’Île-de-France.",
};

export const icons = {
  electricite: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  plomberie:
    '<path d="M12 2.7c3.4 3.9 6 7.3 6 10.6a6 6 0 0 1-12 0c0-3.3 2.6-6.7 6-10.6z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
  menuiserie:
    '<path d="m15 12-8.4 8.4a2 2 0 0 1-2.8-2.8L12.2 9"/><path d="M17.6 15 22 10.6"/><path d="m20.9 11.7-1.3-1.3c-.6-.6-.9-1.3-.9-2.1V7l-2.3-2.3a6 6 0 0 0-4.2-1.7H9l.9.8a6.2 6.2 0 0 1 2.1 4.6V10l2 2h1.2c.8 0 1.5.3 2.1.9l1.3 1.3"/>',
  peinture:
    '<rect x="3" y="3" width="16" height="6" rx="1.5"/><path d="M19 6h1.5a.5.5 0 0 1 .5.5V11a1 1 0 0 1-1 1h-8v3"/><rect x="10" y="15" width="4" height="7" rx="1"/>',
  sols: '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>',
  platrerie:
    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
  carrelage:
    '<rect x="3" y="3" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1"/>',
  parquet:
    '<path d="M3 5h8v4H3z"/><path d="M11 5h10v4H11z"/><path d="M3 9h12v4H3z"/><path d="M15 9h6v4h-6z"/><path d="M3 13h6v4H3z"/><path d="M9 13h12v4H9z"/><path d="M3 17h10v3H3z"/><path d="M13 17h8v3h-8z"/>',
  phone:
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  whatsapp:
    '<path d="M3.5 20.5 5 16.3A8.5 8.5 0 1 1 8 19.1l-4.5 1.4z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1a4 4 0 0 1-2.4-2.4l1-1-1-2L9.6 8"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
  sms: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  spark: '<path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="m6.3 6.3 2.1 2.1"/><path d="m15.6 15.6 2.1 2.1"/><path d="m6.3 17.7 2.1-2.1"/><path d="m15.6 8.4 2.1-2.1"/>',
  missed: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/><path d="m16 2 6 6"/><path d="m22 2-6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  replay: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
};

export const metiers = [
  {
    slug: "electricite",
    name: "Électricité",
    short: "Installation, rénovation et mise aux normes",
    title: "Travaux d’électricité en Île-de-France",
    metaTitle: "Électricité : rénovation et mise aux normes en Île-de-France",
    intro:
      "Tableau électrique vieillissant, prises qui manquent, rénovation complète d’un logement : nous cadrons votre besoin et vous mettons en relation avec un électricien adapté à votre chantier.",
    prestations: [
      "Rénovation partielle ou complète de l’installation",
      "Remplacement ou mise en conformité du tableau électrique",
      "Ajout de prises, interrupteurs et points lumineux",
      "Éclairage intérieur et extérieur",
      "Raccordement d’équipements (plaques, four, chauffe-eau…)",
      "Mise aux normes avant vente ou location",
    ],
    conseils: [
      "Indiquez l’âge approximatif de l’installation et le type de tableau (fusibles, disjoncteurs).",
      "Une photo du tableau électrique aide beaucoup à préparer la visite.",
      "Précisez si le logement est occupé pendant les travaux.",
    ],
    faq: [
      [
        "Faut-il refaire toute l’installation électrique ?",
        "Pas forcément. Selon l’état de l’installation, une mise en sécurité ciblée peut suffire. C’est la visite sur place qui permet au professionnel de le déterminer et de chiffrer précisément.",
      ],
      [
        "Peut-on combiner électricité et autres travaux ?",
        "Oui. L’électricité intervient souvent avant la plâtrerie et la peinture : nous pouvons regrouper ces métiers dans une même demande.",
      ],
    ],
  },
  {
    slug: "plomberie",
    name: "Plomberie",
    short: "Réseaux, équipements et dépannages",
    title: "Travaux de plomberie en Île-de-France",
    metaTitle: "Plomberie : réseaux, équipements et dépannages en Île-de-France",
    intro:
      "Création ou reprise de réseaux, remplacement d’équipements, salle de bain ou cuisine à raccorder : décrivez votre besoin, nous vous orientons vers le bon plombier.",
    prestations: [
      "Création et modification de réseaux d’eau et d’évacuation",
      "Pose et remplacement de sanitaires (WC, lavabo, douche, baignoire)",
      "Raccordement de cuisine et d’électroménager",
      "Remplacement de chauffe-eau ou ballon",
      "Recherche et réparation de fuites",
      "Plomberie dans le cadre d’une rénovation de salle de bain",
    ],
    conseils: [
      "Précisez si l’intervention est urgente (fuite active) ou planifiée.",
      "Ajoutez des photos des équipements concernés et des arrivées d’eau.",
      "Indiquez l’étage et l’accès (immeuble, maison, cave).",
    ],
    faq: [
      [
        "Pouvez-vous coordonner plomberie et carrelage pour une salle de bain ?",
        "Oui. Une salle de bain mobilise souvent plomberie, électricité, plâtrerie et carrelage. Sélectionnez les métiers concernés : nous organisons la suite.",
      ],
      [
        "La demande est-elle engageante ?",
        "Non. Votre demande est sans engagement : elle sert uniquement à étudier votre projet et préparer la visite.",
      ],
    ],
  },
  {
    slug: "menuiserie",
    name: "Menuiserie",
    short: "Agencement et finitions sur mesure",
    title: "Travaux de menuiserie en Île-de-France",
    metaTitle: "Menuiserie : agencement et finitions sur mesure en Île-de-France",
    intro:
      "Placards, dressings, portes intérieures, habillages : la menuiserie donne le niveau de finition d’un intérieur. Nous vous mettons en relation avec un menuisier adapté à votre projet.",
    prestations: [
      "Placards et dressings sur mesure",
      "Pose et remplacement de portes intérieures",
      "Agencement de rangements et bibliothèques",
      "Habillages, plinthes et finitions",
      "Pose de cuisines et plans de travail",
      "Petits travaux d’ajustement et de réparation",
    ],
    conseils: [
      "Donnez les dimensions approximatives des espaces à aménager.",
      "Partagez des photos d’inspiration si vous en avez.",
      "Précisez la finition souhaitée (bois brut, laqué, mélaminé…).",
    ],
    faq: [
      [
        "Le sur-mesure est-il possible pour de petits espaces ?",
        "Oui, c’est même souvent là qu’il est le plus utile : sous-pentes, niches, recoins. La visite permet de prendre les cotes exactes.",
      ],
      [
        "Qui réalise et chiffre les travaux ?",
        "L’entreprise réalisatrice, choisie selon votre chantier, vous transmet directement une proposition détaillée.",
      ],
    ],
  },
  {
    slug: "peinture",
    name: "Peinture",
    short: "Préparation, rénovation et mise en couleur",
    title: "Travaux de peinture en Île-de-France",
    metaTitle: "Peinture intérieure : préparation et rénovation en Île-de-France",
    intro:
      "Un rendu durable commence par une bonne préparation des supports. Pour une pièce ou un logement entier, nous vous orientons vers un peintre adapté.",
    prestations: [
      "Préparation des supports (rebouchage, enduits, ponçage)",
      "Peinture des murs et plafonds",
      "Peinture des boiseries, portes et radiateurs",
      "Pose de revêtements muraux",
      "Rafraîchissement avant vente ou location",
      "Mise en couleur et conseils de teintes",
    ],
    conseils: [
      "Indiquez le nombre de pièces et leur surface approximative.",
      "Signalez les fissures, traces d’humidité ou papiers peints à retirer.",
      "Précisez si les pièces seront meublées pendant les travaux.",
    ],
    faq: [
      [
        "Faut-il vider les pièces avant les travaux ?",
        "C’est préférable mais pas toujours indispensable : le professionnel vous indiquera lors de la visite comment protéger ou déplacer le mobilier.",
      ],
      [
        "La peinture peut-elle suivre d’autres travaux ?",
        "Oui, c’est généralement la dernière étape après l’électricité et la plâtrerie. Nous pouvons regrouper ces métiers dans votre demande.",
      ],
    ],
  },
  {
    slug: "sols",
    name: "Sols",
    short: "Préparation et pose de revêtements",
    title: "Travaux de sols en Île-de-France",
    metaTitle: "Sols : préparation et pose de revêtements en Île-de-France",
    intro:
      "Vinyle, stratifié, moquette, ragréage : la réussite d’un sol dépend de sa préparation. Nous vous mettons en relation avec le professionnel adapté à votre revêtement.",
    prestations: [
      "Dépose des anciens revêtements",
      "Ragréage et préparation du support",
      "Pose de sols souples (vinyle, lino, moquette)",
      "Pose de sols stratifiés",
      "Plinthes et barres de seuil",
      "Remise à niveau entre pièces",
    ],
    conseils: [
      "Indiquez la surface et le revêtement actuel.",
      "Précisez le revêtement souhaité si vous l’avez déjà choisi.",
      "Signalez la présence de chauffage au sol.",
    ],
    faq: [
      [
        "Peut-on poser sur l’ancien revêtement ?",
        "Parfois, selon sa nature et son état. Le professionnel le vérifie pendant la visite avant de chiffrer.",
      ],
      [
        "Et pour du parquet ou du carrelage ?",
        "Ces métiers ont leurs propres spécialistes : sélectionnez « Parquet » ou « Carrelage » dans votre demande.",
      ],
    ],
  },
  {
    slug: "platrerie",
    name: "Plâtrerie",
    short: "Cloisons, doublages et faux plafonds",
    title: "Travaux de plâtrerie en Île-de-France",
    metaTitle: "Plâtrerie : cloisons, doublages et faux plafonds en Île-de-France",
    intro:
      "Créer une pièce, isoler un mur par doublage, poser un faux plafond : la plâtrerie redessine les volumes. Nous vous orientons vers un plaquiste adapté.",
    prestations: [
      "Création et démolition de cloisons",
      "Doublages de murs (avec ou sans isolant)",
      "Faux plafonds et soffites",
      "Bandes, enduits et finitions prêtes à peindre",
      "Coffrages et habillages techniques",
      "Reprise de murs et plafonds abîmés",
    ],
    conseils: [
      "Un plan ou un croquis coté, même simple, facilite l’étude.",
      "Précisez si des passages électriques ou de plomberie sont prévus.",
      "Indiquez la hauteur sous plafond.",
    ],
    faq: [
      [
        "Peut-on créer une chambre supplémentaire avec une cloison ?",
        "Oui, c’est un aménagement courant. La visite permet de vérifier la lumière, la ventilation et les passages techniques.",
      ],
      [
        "La plâtrerie inclut-elle la peinture ?",
        "La plâtrerie s’arrête généralement aux finitions prêtes à peindre. Ajoutez « Peinture » à votre demande pour un résultat complet.",
      ],
    ],
  },
  {
    slug: "carrelage",
    name: "Carrelage",
    short: "Pose murale et au sol, finitions soignées",
    title: "Travaux de carrelage en Île-de-France",
    metaTitle: "Carrelage : pose murale et au sol en Île-de-France",
    intro:
      "Salle de bain, cuisine, pièce de vie : le carrelage demande précision et finitions soignées. Nous vous mettons en relation avec un carreleur adapté à votre projet.",
    prestations: [
      "Pose de carrelage au sol",
      "Faïence murale (salle de bain, cuisine)",
      "Crédences et plans de travail carrelés",
      "Préparation et étanchéité des supports",
      "Joints, découpes et finitions",
      "Dépose d’ancien carrelage",
    ],
    conseils: [
      "Indiquez les surfaces au sol et au mur.",
      "Précisez le format de carreaux envisagé (grand format, mosaïque…).",
      "Signalez si le carrelage est déjà acheté.",
    ],
    faq: [
      [
        "Le carreleur peut-il intervenir dans une salle de bain complète ?",
        "Oui, en coordination avec la plomberie et l’électricité. Sélectionnez ces métiers ensemble dans votre demande.",
      ],
      [
        "Qui fournit le carrelage ?",
        "Cela dépend de votre choix : vous pouvez le fournir ou demander qu’il soit inclus dans le devis de l’entreprise.",
      ],
    ],
  },
  {
    slug: "parquet",
    name: "Parquet",
    short: "Pose, rénovation et finitions",
    title: "Travaux de parquet en Île-de-France",
    metaTitle: "Parquet : pose, rénovation et finitions en Île-de-France",
    intro:
      "Pose de parquet neuf, ponçage et vitrification d’un parquet ancien : nous vous mettons en relation avec un professionnel du parquet adapté à votre chantier.",
    prestations: [
      "Pose de parquet massif, contrecollé ou stratifié",
      "Ponçage et rénovation de parquet ancien",
      "Vitrification, huilage ou cirage",
      "Réparation de lames abîmées",
      "Pose de plinthes et finitions",
      "Préparation du support",
    ],
    conseils: [
      "Indiquez la surface et le type de parquet existant ou souhaité.",
      "Une photo de près du parquet actuel aide à évaluer sa rénovation.",
      "Précisez la finition souhaitée (mat, satiné, huilé…).",
    ],
    faq: [
      [
        "Un vieux parquet peut-il être rénové ?",
        "Souvent oui : un ponçage suivi d’une vitrification ou d’un huilage peut lui redonner un aspect neuf. La visite permet de vérifier l’épaisseur restante.",
      ],
      [
        "Combien de temps faut-il libérer la pièce ?",
        "Cela dépend de la surface et de la finition choisie. Le professionnel vous le précise dans sa proposition.",
      ],
    ],
  },
];

export const zones = {
  idf: {
    name: "Île-de-France",
    departements: [
      ["75", "Paris"],
      ["77", "Seine-et-Marne"],
      ["78", "Yvelines"],
      ["91", "Essonne"],
      ["92", "Hauts-de-Seine"],
      ["93", "Seine-Saint-Denis"],
      ["94", "Val-de-Marne"],
      ["95", "Val-d’Oise"],
    ],
  },
};

// Projets types du configurateur (accueil) : un clic sélectionne les métiers concernés.
export const scenarios = [
  { id: "sdb", name: "Salle de bain", metiers: ["plomberie", "carrelage", "electricite", "platrerie", "peinture"] },
  { id: "cuisine", name: "Cuisine", metiers: ["plomberie", "electricite", "menuiserie", "carrelage", "peinture"] },
  { id: "complete", name: "Rénovation complète", metiers: ["electricite", "plomberie", "menuiserie", "peinture", "sols", "platrerie", "carrelage", "parquet"] },
  { id: "rafraichir", name: "Rafraîchir un logement", metiers: ["peinture", "sols", "parquet"] },
  { id: "piece", name: "Créer une pièce", metiers: ["platrerie", "electricite", "menuiserie", "peinture"] },
  { id: "sols", name: "Sols & parquet", metiers: ["sols", "parquet", "carrelage"] },
];

// Exemples « avant / après » : photos dans src/assets/img/chantiers/<id>-avant.webp et <id>-apres.webp
// (les deux images d'une paire doivent avoir exactement la même taille). shape : "portrait" ou "wide".
export const transformations = [
  {
    id: "sdb",
    name: "Salle de bain",
    shape: "portrait",
    size: [762, 864],
    title: "Une salle de bain entièrement reprise.",
    text: "Carrelage des murs et du sol remplacé, meuble vasque, pare-baignoire et colonne de douche, éclairage encastré.",
    metiers: ["plomberie", "carrelage", "electricite", "peinture"],
  },
  {
    id: "cuisine",
    name: "Cuisine",
    shape: "wide",
    size: [1536, 429],
    title: "Une cuisine remise à neuf.",
    text: "Nouveaux meubles, plan de travail et crédence en bois, évier noir, chaudière intégrée et murs repeints.",
    metiers: ["menuiserie", "plomberie", "electricite", "peinture"],
  },
  {
    id: "salon",
    name: "Séjour",
    shape: "wide",
    size: [1536, 429],
    title: "Un séjour modernisé.",
    text: "Papier peint déposé, murs et plafond repeints, nouveau sol et éclairage revu.",
    metiers: ["peinture", "platrerie", "sols", "electricite"],
  },
  {
    id: "chambre",
    name: "Chambre",
    shape: "portrait",
    size: [762, 864],
    title: "Une chambre remise en état.",
    text: "Murs repris et repeints, parquet en chevrons rénové.",
    metiers: ["peinture", "platrerie", "parquet"],
  },
];
