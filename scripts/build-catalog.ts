/**
 * Build the product catalog from the client's Shopify Excel exports.
 *
 * Sources (../ relative to the app):
 *  - "Troo Bio-Labs Products & Descriptions.xlsx"  (primary: rich descriptions)
 *  - "products_export(1).xlsx"                      (secondary: extra metadata)
 *  - "Product Images/<Category>/*.webp|png"         (5 category folders)
 *  - "pdf/*.pdf"                                    (COAs / purity reports)
 *
 * Output:
 *  - src/data/catalog.json
 *  - public/images/products/<handle>/<n>.webp      (copied assets)
 *  - public/docs/coa/*.pdf                          (copied COAs)
 *
 * Run: npx tsx scripts/build-catalog.ts
 */
import * as XLSX from "xlsx";
import * as fs from "node:fs";
import * as path from "node:path";

const APP = path.resolve(__dirname, "..");
const ROOT = path.resolve(APP, "..");
const IMAGES_DIR = path.join(ROOT, "Product Images");
const PDF_DIR = path.join(ROOT, "pdf");
const OUT_JSON = path.join(APP, "src", "data", "catalog.json");
const OUT_IMG = path.join(APP, "public", "images", "products");
const OUT_PDF = path.join(APP, "public", "docs", "coa");

/* ---------------------------------- helpers --------------------------------- */

type Row = Record<string, string | number | boolean | null | undefined>;

function sheetRows(file: string): Row[] {
  const wb = XLSX.readFile(file);
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Row>(ws, { defval: "" });
}

const str = (v: unknown) => String(v ?? "").trim();

/** Convert Shopify rich-text AST (JSON string) to clean HTML. */
function richTextToHtml(raw: string): string {
  if (!raw) return "";
  let node: unknown;
  try {
    node = JSON.parse(raw);
  } catch {
    return `<p>${raw}</p>`;
  }
  interface RtNode {
    type?: string;
    value?: string;
    url?: string;
    level?: number;
    listType?: string;
    bold?: boolean;
    italic?: boolean;
    children?: RtNode[];
  }
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const render = (n: RtNode): string => {
    const kids = (n.children ?? []).map(render).join("");
    switch (n.type) {
      case "root":
        return kids;
      case "paragraph":
        return kids.trim() ? `<p>${kids}</p>` : "";
      case "heading":
        return `<h${n.level ?? 3}>${kids}</h${n.level ?? 3}>`;
      case "list":
        return n.listType === "ordered" ? `<ol>${kids}</ol>` : `<ul>${kids}</ul>`;
      case "list-item":
        return `<li>${kids}</li>`;
      case "link":
        return `<a href="${esc(n.url ?? "#")}" target="_blank" rel="noopener noreferrer">${kids}</a>`;
      case "text": {
        let t = esc(n.value ?? "");
        if (n.bold) t = `<strong>${t}</strong>`;
        if (n.italic) t = `<em>${t}</em>`;
        return t;
      }
      default:
        return kids;
    }
  };
  return render(node as RtNode);
}

/** Split a "- item\n- item" style cell into a clean string list. */
function toList(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*-\s*/, "").trim())
    .filter(Boolean);
}

/** Deterministic pseudo-rating so the UI matches the design (no real review data yet). */
function seeded(handle: string): { rating: number; reviews: number } {
  let h = 0;
  for (const ch of handle) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const rating = 4.6 + ((h % 4) / 10) * 0.75; // 4.6 – 4.9
  const reviews = 18 + (h % 200);
  return { rating: Math.round(rating * 10) / 10, reviews };
}

/* ------------------------------ per-product config ---------------------------- */

const CAT_BY_FOLDER: Record<string, string> = {
  Cellular: "cellular",
  Endocrine: "endocrine",
  Metabolic: "metabolic",
  Neural: "neural",
  Tissue: "tissue",
};

/** handle -> ordered local design images "<Folder>/<file>" (webp preferred). */
const IMAGE_MAP: Record<string, string[]> = {
  "wolverine-blend-bpc-157-tb-500": ["Tissue/troo-biolabs-peptide-tissue-photo-wolverine.webp"],
  "klow-blend": ["Tissue/troo-biolabs-peptide-tissue-photo-klow.webp"],
  "glow-blend": ["Tissue/troo-biolabs-peptide-tissue-photo-glow.webp"],
  "bpc-157": [
    "Tissue/troo-biolabs-peptide-tissue-photo-bpc157-5mg.webp",
    "Tissue/troo-biolabs-peptide-tissue-photo-bpc157-10mg.webp",
  ],
  "tb-500": ["Tissue/troo-biolabs-peptide-tissue-photo-tb500.webp"],
  "ghk-cu": [
    "Tissue/troo-biolabs-peptide-tissue-photo-ghkcu-50mg.webp",
    "Tissue/troo-biolabs-peptide-tissue-photo-ghkcu-100mg.webp",
  ],
  "aod-9604": ["Metabolic/troo-biolabs-peptide-metabolic-photo-aod9604.webp"],
  cagrilintide: ["Metabolic/troo-biolabs-peptide-metabolic-photo-cagrilintide.webp"],
  "glp-1-s": [
    "Metabolic/troo-biolabs-peptide-metabolic-photo-gpl1-s.webp",
    "Metabolic/troo-biolabs-peptide-metabolic-photo-gpl1-s-10mg.webp",
  ],
  "glp-1-gip-t": [
    "Metabolic/troo-biolabs-peptide-metabolic-photo-gpl1-gipT.webp",
    "Metabolic/troo-biolabs-peptide-metabolic-photo-gpl2-t-10mg.webp",
    "Metabolic/troo-biolabs-peptide-metabolic-photo-gpl2-t-15mg.webp",
    "Metabolic/troo-biolabs-peptide-metabolic-photo-gpl2-t-30mg.webp",
  ],
  "glp-3-r": [
    "Metabolic/troo-biolabs-peptide-metabolic-photo-gpl3-r-10mg.webp",
    "Metabolic/troo-biolabs-peptide-metabolic-photo-gpl3-r-15mg.webp",
    "Metabolic/troo-biolabs-peptide-metabolic-photo-gpl3-r-30mg.webp",
  ],
  "cjc-1295-no-dac-plus-ipamorelin": [
    "Endocrine/troo-biolabs-peptide-endocrine-photo-cjc1295-ipamorelin.webp",
  ],
  hexarelin: ["Endocrine/troo-biolabs-peptide-endocrine-photo-hexarelin.webp"],
  ipamorelin: ["Endocrine/troo-biolabs-peptide-endocrine-photo-ipamorelin.webp"],
  kisspeptin: ["Endocrine/troo-biolabs-peptide-endocrine-photo-kisspeptin.webp"],
  "pt-141": ["Endocrine/troo-biolabs-peptide-endocrine-photo-pt141.webp"],
  sermorelin: ["Endocrine/troo-biolabs-peptide-endocrine-photo-sermorelin.webp"],
  tesamorelin: ["Endocrine/troo-biolabs-peptide-endocrine-photo-tesamorelin.webp"],
  "mots-c": ["Cellular/troo-biolabs-peptide-cellular-photo-mots-c-10mg.webp"],
  "nad-plus": [
    "Cellular/troo-biolabs-peptide-cellular-photo-nad+-500mg.webp",
    "Cellular/troo-biolabs-peptide-cellular-photo-nad+-1000mg-.webp",
  ],
  oxytocin: ["Neural/troo-biolabs-peptide-neural-photo-oxytocin-5mg.webp"],
  selank: ["Neural/troo-biolabs-peptide-neural-photo-selank-10mg.webp"],
  semax: ["Neural/troo-biolabs-peptide-neural-photo-semax-10mg.webp"],
};

/** Category for products with no image folder signal. */
const CAT_OVERRIDES: Record<string, string> = {
  dsip: "neural",
  kpv: "tissue",
  "l-glutathione": "cellular",
  "melanotan-ii": "endocrine",
  "thymosin-alpha-1": "cellular",
  "acetic-acid-0-6": "supplies",
  "bacteriostatic-water": "supplies",
};

/** Design-style compound subtitles. */
const SUB_MAP: Record<string, string> = {
  "wolverine-blend-bpc-157-tb-500": "BPC-157 + TB-500",
  "klow-blend": "GHK-Cu + TB-500 + BPC-157 + KPV",
  "glow-blend": "GHK-Cu + BPC-157 + TB-500",
  "bpc-157": "Body Protection Compound",
  "tb-500": "Thymosin Beta-4 Fragment",
  "ghk-cu": "Copper Tripeptide-1",
  kpv: "α-MSH Fragment (Lys-Pro-Val)",
  "glp-1-s": "GLP-1 Receptor Agonist",
  "glp-1-gip-t": "GIP / GLP-1 Dual Agonist",
  "glp-3-r": "Triple Receptor Agonist",
  "aod-9604": "hGH Fragment 176-191",
  cagrilintide: "Long-Acting Amylin Analog",
  "cjc-1295-no-dac-plus-ipamorelin": "GHRH + GHRP Blend",
  ipamorelin: "Selective GH Secretagogue",
  sermorelin: "GHRH (1-29) Analog",
  tesamorelin: "GHRH Analog",
  hexarelin: "GH Secretagogue",
  kisspeptin: "KISS1 Neuropeptide",
  "pt-141": "Bremelanotide",
  "nad-plus": "Nicotinamide Adenine Dinucleotide",
  "mots-c": "Mitochondrial-Derived Peptide",
  "l-glutathione": "Reduced Glutathione (GSH)",
  dsip: "Delta Sleep-Inducing Peptide",
  selank: "Anxiolytic Heptapeptide",
  semax: "Nootropic Heptapeptide",
  oxytocin: "Nonapeptide Hormone",
  "melanotan-ii": "Melanocortin Agonist",
  "thymosin-alpha-1": "Immune Peptide Tα1",
  "bacteriostatic-water": "Reconstitution Solvent",
  "acetic-acid-0-6": "0.6% Sterile Solution",
};

const FEATURED = new Set(["wolverine-blend-bpc-157-tb-500"]);
const POPULAR = new Set([
  "wolverine-blend-bpc-157-tb-500",
  "bpc-157",
  "glp-1-s",
  "cjc-1295-no-dac-plus-ipamorelin",
  "glp-1-gip-t",
]);

/** handle -> COA purity PDF in ../pdf */
const COA_MAP: Record<string, string> = {
  "wolverine-blend-bpc-157-tb-500": "AARLL-2917829-P - BPC-157 + TB-500 - Purity.pdf",
  "bpc-157": "AARLL-3548854-P - BPC-157 - Purity.pdf",
  "ghk-cu": "AARLL-6057169-P - GHK-Cu - Purity.pdf",
  "cjc-1295-no-dac-plus-ipamorelin": "AARLL-4328886-P - Ipamorelin + CJC-1295 - Purity.pdf",
  "nad-plus": "AARLL-4407912-P - NAD+ - Purity.pdf",
  "klow-blend": "AARLL-4436937-P - KLOW - Purity.pdf",
  "glow-blend": "AARLL-9004218-P - GLOW - Purity.pdf",
  "glp-3-r": "AARLL-9759917-P - Retatrutide - Purity.pdf",
  "glp-1-gip-t": "AARLL-8597576-P - Tirzepatide - Purity.pdf",
  "pt-141": "AARLL-6170177-P - PT-141 - Purity.pdf",
  hexarelin: "AARLL-7132129-P - Hexarelin - Purity.pdf",
  tesamorelin: "AARLL-7980975-P - Tesamorelin - Purity.pdf",
  selank: "AARLL-8583052-P - Selank - Purity.pdf",
};

/* ----------------------------------- build ----------------------------------- */

const primary = sheetRows(path.join(ROOT, "Troo Bio-Labs Products & Descriptions.xlsx"));
const secondary = sheetRows(path.join(ROOT, "products_export(1).xlsx"));

const col = (row: Row, prefix: string): string => {
  const key = Object.keys(row).find((k) => k.startsWith(prefix));
  return key ? str(row[key]) : "";
};

interface Variant {
  size: string;
  price: number;
  compareAt: number | null;
  image: string | null;
  inStock: boolean;
}

interface Product {
  id: string;
  name: string;
  sub: string;
  vendor: string;
  cat: string;
  featured: boolean;
  popular: boolean;
  inStock: boolean;
  images: string[];
  sizes: Variant[];
  rating: number;
  reviews: number;
  shortDesc: string;
  seoTitle: string;
  seoDesc: string;
  additionalNotes: string;
  longDescPlain: string;
  longDescSci: string;
  moaPlain: string;
  moaSci: string;
  researchStudies: string;
  references: string;
  applications: string[];
  specs: {
    altNames: string;
    cas: string;
    form: string;
    formula: string;
    mw: string;
    purity: string;
    sequence: string;
    storage: string;
  };
  coa: { file: string; label: string } | null;
  status: string;
}

/** group primary rows by handle (variant rows have empty Title) */
const byHandle = new Map<string, Row[]>();
for (const row of primary) {
  const handle = str(row["Handle"]);
  if (!handle) continue;
  if (!byHandle.has(handle)) byHandle.set(handle, []);
  byHandle.get(handle)!.push(row);
}

const secondaryByHandle = new Map<string, Row[]>();
for (const row of secondary) {
  const handle = str(row["Handle"]);
  if (!handle) continue;
  if (!secondaryByHandle.has(handle)) secondaryByHandle.set(handle, []);
  secondaryByHandle.get(handle)!.push(row);
}

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.mkdirSync(OUT_IMG, { recursive: true });
fs.mkdirSync(OUT_PDF, { recursive: true });

const products: Product[] = [];

for (const [handle, rows] of byHandle) {
  const head = rows[0];
  const name = str(head["Title"]);
  if (!name) continue;

  // ---- images: copy to public with normalized names -------------------------
  const sources = IMAGE_MAP[handle] ?? [];
  const images: string[] = [];
  let cat = CAT_OVERRIDES[handle] ?? "";
  sources.forEach((rel, i) => {
    const [folder] = rel.split("/");
    if (!cat) cat = CAT_BY_FOLDER[folder] ?? "";
    const src = path.join(IMAGES_DIR, rel);
    if (!fs.existsSync(src)) {
      console.warn(`  ! missing image: ${rel}`);
      return;
    }
    const destDir = path.join(OUT_IMG, handle);
    fs.mkdirSync(destDir, { recursive: true });
    const destName = `${i + 1}${path.extname(rel)}`;
    fs.copyFileSync(src, path.join(destDir, destName));
    images.push(`/images/products/${handle}/${destName}`);
  });
  if (!cat) cat = "cellular";

  // ---- variants -------------------------------------------------------------
  const sizes: Variant[] = rows
    .filter((r) => str(r["Option1 Value"]))
    .map((r, i) => ({
      size: str(r["Option1 Value"]),
      price: Number(r["Variant Price"]) || 0,
      compareAt: Number(r["Variant Compare At Price"]) || null,
      image: images[i] ?? null,
      inStock: true,
    }));

  /* extra columns only present in the products_export(1) sheet */
  const secHead = secondaryByHandle.get(handle)?.[0];

  // ---- COA ------------------------------------------------------------------
  let coa: Product["coa"] = null;
  const coaFile = COA_MAP[handle];
  if (coaFile && fs.existsSync(path.join(PDF_DIR, coaFile))) {
    const lot = coaFile.split(" - ")[0];
    fs.copyFileSync(path.join(PDF_DIR, coaFile), path.join(OUT_PDF, coaFile));
    coa = { file: `/docs/coa/${encodeURIComponent(coaFile)}`, label: lot };
  }

  const { rating, reviews } = seeded(handle);

  products.push({
    id: handle,
    name,
    sub: SUB_MAP[handle] ?? "",
    vendor: str(head["Vendor"]) || (secHead ? str(secHead["Vendor"]) : "") || "Troo Bio-Labs",
    cat,
    featured: FEATURED.has(handle),
    popular: POPULAR.has(handle),
    inStock: true,
    images,
    sizes,
    rating,
    reviews,
    shortDesc: col(head, "Short Product Description"),
    seoTitle: (secHead ? col(secHead, "SEO Title") : "") || "",
    seoDesc: col(head, "SEO Description") || (secHead ? col(secHead, "SEO Description") : "") || "",
    additionalNotes: (secHead ? col(secHead, "Additional Notes") : "") || "",
    longDescPlain: richTextToHtml(col(head, "Long Product Description - Plain English")),
    longDescSci: richTextToHtml(col(head, "Long Product Description - Scientific")),
    moaPlain: richTextToHtml(col(head, "Mechanism of Action (plain english)")),
    moaSci: richTextToHtml(col(head, "Mechanism of Action (scientific)")),
    researchStudies: richTextToHtml(col(head, "Research Studies")),
    references: richTextToHtml(col(head, "References")),
    applications: toList(col(head, "Research Applications")),
    specs: {
      altNames: col(head, "Alternate Names / Synonyms"),
      cas: col(head, "CAS Number"),
      form: col(head, "Form"),
      formula: col(head, "Molecular Formula"),
      mw: col(head, "Molecular Weight (MW)"),
      purity: col(head, "Purity"),
      sequence: col(head, "Sequence"),
      storage: col(head, "Storage Conditions"),
    },
    coa,
    status: str(head["Status"]) || "active",
  });
}

/* categories written alongside products so the API layer has one source */
const categories = [
  { id: "tissue", name: "Tissue Repair & Recovery", color: "#D9368A", blurb: "Compounds studied in wound-healing, angiogenesis and recovery models." },
  { id: "metabolic", name: "Metabolic & GLP-1", color: "#1486C9", blurb: "Incretin analogs studied in metabolic, glycemic and appetite research." },
  { id: "endocrine", name: "Endocrine & GH", color: "#F47B2A", blurb: "GHRH analogs and secretagogues for endocrine-axis research." },
  { id: "cellular", name: "Cellular & Longevity", color: "#73B84A", blurb: "Compounds studied in cellular aging and mitochondrial models." },
  { id: "neural", name: "Neural & Cognitive", color: "#8D43B8", blurb: "Neuropeptides studied in cognition and stress-response models." },
  { id: "supplies", name: "Lab Supplies", color: "#5A55D6", blurb: "Solvents and consumables for reconstitution and lab protocols." },
];

fs.writeFileSync(OUT_JSON, JSON.stringify({ categories, products }, null, 2));
console.log(`Wrote ${products.length} products -> ${path.relative(APP, OUT_JSON)}`);
console.log(
  products
    .map(
      (p) =>
        `  ${p.id}  [${p.cat}]  ${p.sizes.map((s) => s.size).join("/")}  imgs:${p.images.length}  coa:${p.coa ? "y" : "-"}`,
    )
    .join("\n"),
);
