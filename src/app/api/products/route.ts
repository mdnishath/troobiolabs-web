import { NextResponse } from "next/server";
import { provider } from "@/lib/api/provider";

export async function GET() {
  const [products, categories] = await Promise.all([
    provider.getProducts(),
    provider.getCategories(),
  ]);
  return NextResponse.json({ products, categories });
}
