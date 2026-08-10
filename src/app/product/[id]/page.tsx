import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Product } from "@/lib/types";
import { provider } from "@/lib/api/provider";
import { ProductDetail } from "@/components/product/ProductDetail";

/* refresh WP-managed content every 5 minutes without a rebuild */
export const revalidate = 300;

export async function generateStaticParams() {
  const products = await provider.getProducts();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = await provider.getProduct(id);
  if (!p) return { title: "Product not found" };
  return {
    title: p.name,
    description: p.shortDesc || `${p.name} — research-grade compound.`,
  };
}

function pickRelated(all: Product[], p: Product): Product[] {
  const pool = all.filter(
    (x) => x.id !== p.id && x.status === "active" && x.images.length > 0,
  );
  const sameCat = pool.filter((x) => x.cat === p.cat);
  const rest = pool
    .filter((x) => x.cat !== p.cat)
    .sort(
      (a, b) =>
        (b.featured ? 2 : 0) + (b.popular ? 1 : 0) -
        ((a.featured ? 2 : 0) + (a.popular ? 1 : 0)),
    );
  return [...sameCat, ...rest].slice(0, 4);
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[id]">) {
  const { id } = await params;
  const [product, all, categories] = await Promise.all([
    provider.getProduct(id),
    provider.getProducts(),
    provider.getCategories(),
  ]);
  if (!product) notFound();

  return (
    <ProductDetail
      product={product}
      category={categories.find((c) => c.id === product.cat)}
      related={pickRelated(all, product)}
    />
  );
}
