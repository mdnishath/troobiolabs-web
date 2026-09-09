/**
 * Build the product catalog from the client's Excel export.
 *
 * Sources (../ relative to the app):
 *  - "All Products.xlsx"                             (single source of truth)
 *  - "Product Images/<Category>/webp-transparent/*"  (optimized webp images)
 *  - "pdf/*.pdf"                                     (COAs / purity reports)
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
import { COA_REPORTS, coaPublicPath } from "./coa-map";

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

/** handle -> ordered optimized webp images "<Category>/webp-transparent/<file>". */
const W = (cat: string, name: string) =>
  `${cat}/webp-transparent/troo-${name}-transparent.webp`;

const IMAGE_MAP: Record<string, string[]> = {
  "wolverine-blend-bpc-157-tb-500": [W("Tissue", "wolverine")],
  "klow-blend": [W("Tissue", "klow")],
  "glow-blend": [W("Tissue", "glow")],
  "bpc-157": [W("Tissue", "bpc157-5mg"), W("Tissue", "bpc157-10mg")],
  "tb-500": [W("Tissue", "tb500")],
  "ghk-cu": [W("Tissue", "ghkcu-50mg"), W("Tissue", "ghkcu-100mg")],
  "aod-9604": [W("Metabolic", "aod9604")],
  cagrilintide: [W("Metabolic", "cagrilintide")],
  "glp-1-s": [W("Metabolic", "gpl1-s"), W("Metabolic", "gpl1-s-10mg")],
  "glp-1-gip-t": [
    W("Metabolic", "gpl2-t-10mg"),
    W("Metabolic", "gpl2-t-15mg"),
    W("Metabolic", "gpl2-t-30mg"),
  ],
  "glp-3-r": [
    W("Metabolic", "gpl3-r-10mg"),
    W("Metabolic", "gpl3-r-15mg"),
    W("Metabolic", "gpl3-r-30mg"),
  ],
  "cjc-1295-no-dac-plus-ipamorelin": [W("Endocrine", "cjc1295-ipamorelin")],
  hexarelin: [W("Endocrine", "hexarelin")],
  ipamorelin: [W("Endocrine", "ipamorelin")],
  kisspeptin: [W("Endocrine", "kisspeptin")],
  "pt-141": [W("Endocrine", "pt141")],
  sermorelin: [W("Endocrine", "sermorelin")],
  tesamorelin: [W("Endocrine", "tesamorelin")],
  "mots-c": [W("Cellular", "mots-c-10mg")],
  "nad-plus": [W("Cellular", "nad+-500mg"), W("Cellular", "nad+-1000mg")],
  oxytocin: [W("Neural", "oxytocin-5mg")],
  selank: [W("Neural", "selank-10mg")],
  semax: [W("Neural", "semax-10mg")],
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

/* ----------------------------------- build ----------------------------------- */

const primary = sheetRows(path.join(ROOT, "All Products.xlsx"));

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
  coas: {
    lot: string;
    file: string;
    purity: string;
    identity: "confirmed" | "unconfirmed";
    note: string;
  }[];
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
  sources.forEach((rel) => {
    const [folder] = rel.split("/");
    if (!cat) cat = CAT_BY_FOLDER[folder] ?? "";
    const src = path.join(IMAGES_DIR, rel);
    if (!fs.existsSync(src)) {
      console.warn(`  ! missing image: ${rel}`);
      return;
    }
    const destDir = path.join(OUT_IMG, handle);
    fs.mkdirSync(destDir, { recursive: true });
    /* keep the original descriptive filename — it doubles as the WP media slug */
    const destName = path.basename(rel);
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

  // ---- COAs -----------------------------------------------------------------
  const coas: Product["coas"] = [];
  for (const r of COA_REPORTS[handle] ?? []) {
    if (!fs.existsSync(path.join(PDF_DIR, r.pdf))) {
      console.warn(`  ! missing COA pdf for ${handle}: ${r.pdf}`);
      continue;
    }
    fs.copyFileSync(path.join(PDF_DIR, r.pdf), path.join(OUT_PDF, r.pdf));
    coas.push({
      lot: r.lot,
      file: coaPublicPath(r.pdf),
      purity: r.purity,
      identity: r.identity,
      note: r.note ?? "",
    });
  }
  const coa: Product["coa"] = coas.length
    ? { file: coas[0].file, label: coas[0].lot }
    : null;

  const { rating, reviews } = seeded(handle);

  products.push({
    id: handle,
    name,
    sub: SUB_MAP[handle] ?? "",
    vendor: str(head["Vendor"]) || "Troo Bio-Labs",
    cat,
    featured: FEATURED.has(handle),
    popular: POPULAR.has(handle),
    inStock: true,
    images,
    sizes,
    rating,
    reviews,
    shortDesc: col(head, "Short Product Description"),
    seoTitle: "",
    seoDesc: col(head, "SEO Description"),
    additionalNotes: "",
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
    coas,
    status: str(head["Status"]) || "active",
  });
}

/* categories written alongside products so the API layer has one source */
const categories = [
  { id: "tissue", name: "Tissue Research", color: "#D9368A", blurb: "Compounds studied in wound-healing, angiogenesis and recovery models." },
  { id: "metabolic", name: "Metabolic Research", color: "#1486C9", blurb: "Incretin analogs studied in metabolic, glycemic and appetite research." },
  { id: "endocrine", name: "Endocrine Research", color: "#F47B2A", blurb: "GHRH analogs and secretagogues for endocrine-axis research." },
  { id: "cellular", name: "Cellular Research", color: "#73B84A", blurb: "Compounds studied in cellular aging and mitochondrial models." },
  { id: "neural", name: "Neural Research", color: "#8D43B8", blurb: "Neuropeptides studied in cognition and stress-response models." },
  { id: "supplies", name: "Lab Supplies", color: "#5A55D6", blurb: "Solvents and consumables for reconstitution and lab protocols." },
];

fs.writeFileSync(OUT_JSON, JSON.stringify({ categories, products }, null, 2));
console.log(`Wrote ${products.length} products -> ${path.relative(APP, OUT_JSON)}`);
console.log(
  products
    .map(
      (p) =>
        `  ${p.id}  [${p.cat}]  ${p.sizes.map((s) => s.size).join("/")}  imgs:${p.images.length}  coa:${p.coas.length || "-"}`,
    )
    .join("\n"),
);
