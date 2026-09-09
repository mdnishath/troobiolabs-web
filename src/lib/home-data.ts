/**
 * Static homepage content transcribed from the design bundle (index.dc.html).
 * All product data (hero, lab results, COAs, thumbnails) is derived live from
 * the catalog in src/app/page.tsx — only design copy lives here.
 */

export const TINTS: Record<string, [string, string, string]> = {
  "#8D43B8": ["#F5F4FC", "#EFEEFA", "#E2E0F4"],
  "#5A55D6": ["#F5F4FC", "#EFEEFA", "#E2E0F4"],
  "#1486C9": ["#F2F8FC", "#E9F2FA", "#DBE9F4"],
  "#D9368A": ["#FCF3F8", "#F9EAF2", "#F1DAE7"],
  "#F47B2A": ["#FEFAF0", "#FCF4E0", "#F3E7CD"],
  "#73B84A": ["#F5FAF1", "#EEF6E8", "#E0EED7"],
};

export interface Area {
  key: string;
  folder: string;
  title: string;
  catId: string;
  color: string;
  img: string;
  ar: string;
  flip: boolean;
  dark: boolean;
  blurb: string;
  points: [string, string][];
  comps: string[];
}

export const AREAS: Area[] = [
  {
    key: "01", folder: "Cellular", title: "Cellular Research", catId: "cellular", color: "#F47B2A",
    img: "/images/sections/cellular.png", ar: "361/674", flip: false, dark: false,
    blurb: "Compounds central to cellular-energy, senescence and mitochondrial research programs worldwide.",
    points: [
      ["Mitochondrial peptides", "MOTS-c in exercise and metabolic-homeostasis research."],
      ["NAD+ metabolism", "The essential redox coenzyme in cellular-aging models."],
      ["Redox & immune models", "L-Glutathione and Thymosin Alpha-1 in oxidative-stress protocols."],
    ],
    comps: ["MOTS-c", "NAD+", "L-Glutathione", "Thymosin Alpha-1"],
  },
  {
    key: "02", folder: "Endocrine", title: "Endocrine Research", catId: "endocrine", color: "#73B84A",
    img: "/images/sections/endocrine.png", ar: "351/658", flip: true, dark: false,
    blurb: "GHRH analogs and secretagogues for GH-axis pulsatility, receptor-selectivity and neuroendocrine research.",
    points: [
      ["GH-axis studies", "The classic CJC-1295 + Ipamorelin pulsatility pairing."],
      ["GHRH analog references", "Sermorelin, tesamorelin and hexarelin as comparison standards."],
      ["Neuroendocrine signaling", "Kisspeptin and PT-141 in receptor-pathway models."],
    ],
    comps: ["CJC-1295 / Ipamorelin", "Sermorelin", "Tesamorelin", "Hexarelin", "Kisspeptin", "PT-141"],
  },
  {
    key: "03", folder: "Metabolic", title: "Metabolic Research", catId: "metabolic", color: "#1486C9",
    img: "/images/sections/metabolic.png", ar: "359/672", flip: false, dark: false,
    blurb: "Incretin-receptor agonists as model systems for glycemic control, appetite regulation and energy-balance research.",
    points: [
      ["Fragment research", "AOD-9604 — the hGH fragment 176-191 — in lipolysis models."],
      ["Incretin-pathway models", "GLP-1, GIP and glucagon receptor signaling in controlled metabolic assays."],
      ["Dual & triple agonists", "GLP-1/GIP (T) and GLP-3 (R) for frontier multi-receptor studies."],
    ],
    comps: ["AOD-9604", "GLP-1 (S)", "GLP-1/GIP (T)", "GLP-3 (R)", "Cagrilintide"],
  },
  {
    key: "04", folder: "Neural", title: "Neural Research", catId: "neural", color: "#8D43B8",
    img: "/images/sections/neural.png", ar: "355/666", flip: true, dark: true,
    blurb: "Neuropeptides studied in cognition, stress-response and social-behavior models — every lot batch verified before release.",
    points: [
      ["Social-behavior models", "Oxytocin nonapeptide neuroendocrine research."],
      ["Cognition & neuroprotection", "Semax — ACTH(4-7) analog — in performance and protection models."],
      ["Anxiolytic profiling", "Selank tuftsin-analog studies of the stress response."],
    ],
    comps: ["Oxytocin", "Selank", "Semax", "DSIP"],
  },
  {
    key: "05", folder: "Tissue", title: "Tissue Research", catId: "tissue", color: "#D9368A",
    img: "/images/sections/tissue.png", ar: "357/670", flip: false, dark: false,
    blurb: "Peptides studied in wound-healing, tendon, ligament and gut-integrity models — the most requested research area in the catalog.",
    points: [
      ["Wound-healing & tendon models", "BPC-157 and TB-500 in transection, migration and angiogenesis assays."],
      ["Skin & collagen protocols", "GHK-Cu remodeling studies alongside KPV inflammation profiling."],
      ["Fixed-ratio blends", "Wolverine, GLOW and KLOW combine complementary repair pathways in one vial."],
    ],
    comps: ["BPC-157", "TB-500", "GHK-Cu", "KPV", "Wolverine", "GLOW", "KLOW"],
  },
];

export const COA_PANEL = [
  { name: "Purity", method: "Purity Verification", typ: "Reported", ok: true },
  { name: "Identity", method: "ESI Mass Spectrometry", typ: "Sometimes", ok: false },
  { name: "Appearance", method: "Visual inspection", typ: "Not reported", ok: false },
  { name: "Net Content", method: "Gravimetric check", typ: "Not reported", ok: false },
  { name: "Storage Guidance", method: "Per-compound conditions", typ: "Not reported", ok: false },
  { name: "Analyst Sign-Off", method: "Signature + test date", typ: "Not reported", ok: false },
];

export const HOME_FAQ = [
  { q: "How pure are your peptides, and how is that verified?", a: "Every catalog compound meets a batch-verified ≥98% purity floor. Purity and identity are batch verified by an independent US lab, and each lot ships against its own Certificate of Analysis — published in the Lab Reports library before you order." },
  { q: "How do I verify the exact batch I received?", a: "Each vial carries a lot number that maps to that batch’s published certificate. Search the lot in the Lab Reports library to pull its batch-verified purity, identity and test date — the documentation for your specific production lot." },
  { q: "How should lyophilized peptides be stored?", a: "As shipped, lyophilized material is stable at room temperature — sealed, dry, out of direct light. Long-term, store at −20°C. After reconstitution, refrigerate at 2–8°C and use within 2–4 weeks." },
  { q: "How fast do orders ship?", a: "Orders placed before 2:00pm ET ship the same business day with tracking. Standard delivery is 3–5 business days and free over $150; express cold-chain (1–2 days, gel pack) is available at checkout." },
  { q: "What does “Research Use Only” mean?", a: "Every product is a research chemical intended solely for laboratory and in-vitro research by qualified professionals. Not a drug, supplement or food — and checkout requires an explicit research-use acknowledgment." },
  { q: "How can I pay?", a: "All major credit and debit cards, processed securely. ACH transfer and purchase orders are available for universities and registered institutions — contact support to set up institutional billing." },
];
