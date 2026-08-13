export interface Variant {
  size: string;
  price: number;
  compareAt: number | null;
  image: string | null;
  inStock: boolean;
}

export interface ProductSpecs {
  altNames: string;
  cas: string;
  form: string;
  formula: string;
  mw: string;
  purity: string;
  sequence: string;
  storage: string;
}

/** One published Certificate of Analysis. */
export interface CoaReport {
  /** Batch / lot number as printed on the report. */
  lot: string;
  /** PDF URL — WordPress media in woo mode, /docs/coa/… in local mode. */
  file: string;
  /** Measured purity from the report, e.g. "99.24%". Empty if not published. */
  purity: string;
  /** Whether the report's identity (MS) test conformed. */
  identity: "confirmed" | "unconfirmed";
  /** Optional qualifier shown next to the lot, e.g. the vial size tested. */
  note: string;
}

export interface Product {
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
  specs: ProductSpecs;
  /** Primary (most recent) report — kept for the product page header. */
  coa: { file: string; label: string } | null;
  /** Every report published for this compound, newest first. */
  coas: CoaReport[];
  status: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  blurb: string;
}

export interface Catalog {
  categories: Category[];
  products: Product[];
}

export const minPrice = (p: Product) =>
  Math.min(...p.sizes.map((s) => s.price));

export const priceLabel = (p: Product) =>
  (p.sizes.length > 1 ? "From " : "") + "$" + minPrice(p).toFixed(2);
