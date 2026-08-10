/**
 * Static homepage content transcribed from the design bundle (index.dc.html),
 * remapped onto the real catalog handles. Batch numbers/dates are the design's
 * placeholder values until real per-batch data is wired from WooCommerce.
 */

export interface HeroProduct {
  id: string;
  name: string;
  sub: string;
  img: string;
  cat: string;
  color: string;
  purity: string;
  lot: string;
  price: string;
  addSize: string;
  addPrice: number;
}

export const HERO_PRODUCTS: HeroProduct[] = [
  { id: "mots-c", name: "MOTS-c", sub: "Mitochondrial-derived peptide · 10mg vial", img: "/images/sections/cellular.png", cat: "Cellular & Longevity", color: "#F47B2A", purity: "98.7%", lot: "NH-2607-F-063", price: "$70.00", addSize: "10mg", addPrice: 70 },
  { id: "cjc-1295-no-dac-plus-ipamorelin", name: "CJC-1295 / Ipamorelin", sub: "GHRH + GHRP blend · 10mg vial", img: "/images/sections/endocrine.png", cat: "Endocrine & GH", color: "#73B84A", purity: "98.9%", lot: "NH-2606-F-046", price: "$50.00", addSize: "10mg", addPrice: 50 },
  { id: "aod-9604", name: "AOD-9604", sub: "hGH fragment 176-191 · 5mg vial", img: "/images/sections/metabolic.png", cat: "Metabolic & GLP-1", color: "#1486C9", purity: "98.9%", lot: "NH-2607-B-030", price: "$50.00", addSize: "5mg", addPrice: 50 },
  { id: "oxytocin", name: "Oxytocin", sub: "Nonapeptide hormone · 5mg vial", img: "/images/sections/neural.png", cat: "Neural & Cognitive", color: "#8D43B8", purity: "99.3%", lot: "NH-2606-I-050", price: "$90.00", addSize: "5mg", addPrice: 90 },
  { id: "bpc-157", name: "BPC-157", sub: "Body Protection Compound · 5mg / 10mg vial", img: "/images/sections/tissue.png", cat: "Tissue Repair & Recovery", color: "#D9368A", purity: "99.4%", lot: "NH-2606-A-012", price: "From $30.00", addSize: "5mg", addPrice: 30 },
];

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
    key: "01", folder: "Cellular", title: "Cellular & Longevity", catId: "cellular", color: "#F47B2A",
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
    key: "02", folder: "Endocrine", title: "Endocrine & Growth Hormone", catId: "endocrine", color: "#73B84A",
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
    key: "03", folder: "Metabolic", title: "Metabolic & GLP-1", catId: "metabolic", color: "#1486C9",
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
    key: "04", folder: "Neural", title: "Neural & Cognitive", catId: "neural", color: "#8D43B8",
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
    key: "05", folder: "Tissue", title: "Tissue Repair & Recovery", catId: "tissue", color: "#D9368A",
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

export interface LabBatch {
  name: string;
  img: string;
  color: string;
  purity: string;
  lot: string;
  date: string;
}

export const LAB_BATCHES: LabBatch[] = [
  { name: "MOTS-c · 10mg", img: "/images/sections/cellular.png", color: "#F47B2A", purity: "98.7", lot: "NH-2607-F-063", date: "Jul 07, 2026" },
  { name: "CJC-1295 / Ipamorelin · 10mg", img: "/images/sections/endocrine.png", color: "#73B84A", purity: "98.9", lot: "NH-2606-F-046", date: "Jun 26, 2026" },
  { name: "AOD-9604 · 5mg", img: "/images/sections/metabolic.png", color: "#1486C9", purity: "98.9", lot: "NH-2607-B-030", date: "Jul 05, 2026" },
  { name: "Oxytocin · 5mg", img: "/images/sections/neural.png", color: "#8D43B8", purity: "99.3", lot: "NH-2606-I-050", date: "Jun 23, 2026" },
  { name: "BPC-157 · 5mg", img: "/images/sections/tissue.png", color: "#D9368A", purity: "99.4", lot: "NH-2606-A-012", date: "Jun 22, 2026" },
];

export const LATEST_COAS = [
  { name: "Wolverine Blend · 10mg", lot: "NH-2607-A-018", purity: "99.2%", date: "Jul 11, 2026", pdf: "/docs/coa/AARLL-2917829-P%20-%20BPC-157%20%2B%20TB-500%20-%20Purity.pdf" },
  { name: "GLP-1 (S) · 10mg", lot: "NH-2607-A-007", purity: "99.3%", date: "Jul 09, 2026", pdf: null },
  { name: "NAD+ · 500mg", lot: "NH-2607-E-060", purity: "99.5%", date: "Jul 08, 2026", pdf: "/docs/coa/AARLL-4407912-P%20-%20NAD%2B%20-%20Purity.pdf" },
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
