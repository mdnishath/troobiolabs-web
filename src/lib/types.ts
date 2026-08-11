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
  coa: { file: string; label: string } | null;
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
