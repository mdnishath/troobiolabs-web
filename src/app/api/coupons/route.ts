import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { wpConfig, wpFetch } from "@/lib/api/wp";
import { applyCoupon, type CouponLine, type WooCoupon } from "@/lib/api/coupons";

interface Body {
  code: string;
  items: { productId: string; size: string; price: number; qty: number }[];
}

interface WooProductRef {
  id: number;
  on_sale: boolean;
  categories: { id: number }[];
}

/** Restrictions that need each cart line resolved to a real Woo product. */
function needsProducts(c: WooCoupon): boolean {
  return (
    c.exclude_sale_items ||
    c.product_ids.length > 0 ||
    c.excluded_product_ids.length > 0 ||
    c.product_categories.length > 0 ||
    c.excluded_product_categories.length > 0
  );
}

/**
 * Previews a WooCommerce coupon against the cart.
 *
 * The store is the only source of coupons — nothing is hard-coded here, so
 * whatever the client creates in WooCommerce → Marketing → Coupons works.
 * The order itself is created with `coupon_lines`, which makes Woo apply and
 * record the coupon for real; this route is what lets checkout show the
 * discount before that happens.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const code = body.code?.trim();

  if (!code) {
    return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 });
  }
  if (!body.items?.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (!wpConfig()) {
    return NextResponse.json(
      { error: "Coupons are unavailable right now." },
      { status: 503 },
    );
  }

  /* email restrictions are checked against the signed-in account */
  const session = await getSession();

  try {
    const found = await wpFetch<WooCoupon[]>(
      `/wc/v3/coupons?code=${encodeURIComponent(code.toLowerCase())}`,
    );
    if (!found.ok) {
      return NextResponse.json(
        { error: "Could not check that coupon — please try again." },
        { status: 502 },
      );
    }
    const coupon = found.data?.[0];
    if (!coupon) {
      return NextResponse.json(
        { error: `"${code}" is not a valid coupon code.` },
        { status: 404 },
      );
    }

    /* only pay for the product lookups when a restriction actually needs them */
    let lines: CouponLine[];
    if (needsProducts(coupon)) {
      lines = await Promise.all(
        body.items.map(async (item) => {
          const res = await wpFetch<WooProductRef[]>(
            `/wc/v3/products?slug=${encodeURIComponent(item.productId)}`,
          );
          const p = res.ok ? res.data?.[0] : undefined;
          return {
            productId: p?.id ?? null,
            categoryIds: p?.categories?.map((c) => c.id) ?? [],
            onSale: p?.on_sale ?? false,
            price: item.price,
            qty: item.qty,
          };
        }),
      );
    } else {
      lines = body.items.map((item) => ({
        productId: null,
        categoryIds: [],
        onSale: false,
        price: item.price,
        qty: item.qty,
      }));
    }

    const result = applyCoupon(coupon, lines, {
      email: session?.email ?? "",
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 409 });
    }

    return NextResponse.json({
      /* Woo stores codes lower-cased; echo that back so the order matches */
      code: coupon.code,
      discount: result.discount,
      freeShipping: result.freeShipping,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not check that coupon — please try again." },
      { status: 502 },
    );
  }
}
