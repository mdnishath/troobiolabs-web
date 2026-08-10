import { NextResponse } from "next/server";
import { provider } from "@/lib/api/provider";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/products/[id]">,
) {
  const { id } = await ctx.params;
  const product = await provider.getProduct(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}
