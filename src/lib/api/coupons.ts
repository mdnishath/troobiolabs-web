import "server-only";

/**
 * Coupon rules, mirrored from WooCommerce so the checkout can show the right
 * discount before the order exists.
 *
 * WooCommerce stays the authority: the code is only ever previewed here, and
 * the order is created with `coupon_lines`, which makes Woo re-validate and
 * apply it (and record the usage) exactly as it would on its own checkout.
 * A coupon Woo rejects fails the order rather than silently discounting it.
 */

export interface WooCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  date_expires: string | null;
  usage_limit: number | null;
  usage_count: number;
  product_ids: number[];
  excluded_product_ids: number[];
  product_categories: number[];
  excluded_product_categories: number[];
  minimum_amount: string;
  maximum_amount: string;
  free_shipping: boolean;
  exclude_sale_items: boolean;
  email_restrictions: string[];
  limit_usage_to_x_items: number | null;
}

/** A cart line resolved against the store, so restrictions can be evaluated. */
export interface CouponLine {
  /** WooCommerce product id, or null when the line could not be resolved */
  productId: number | null;
  categoryIds: number[];
  onSale: boolean;
  price: number;
  qty: number;
}

export type CouponResult =
  | { ok: true; discount: number; freeShipping: boolean }
  | { ok: false; reason: string };

const money = (v: number) => Math.round(v * 100) / 100;
const num = (v: string | null | undefined) => {
  const n = Number.parseFloat(v ?? "");
  return Number.isFinite(n) ? n : 0;
};

/** `*` matches any run of characters — the only wildcard Woo supports here. */
function wildcardMatch(rule: string, value: string): boolean {
  const parts = rule.split("*");
  if (parts.length === 1) return rule === value;

  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!value.startsWith(first) || !value.endsWith(last)) return false;

  let at = first.length;
  for (const part of parts.slice(1, -1)) {
    const found = value.indexOf(part, at);
    if (found === -1) return false;
    at = found + part.length;
  }
  /* the trailing part must still fit after everything matched so far */
  return value.length - last.length >= at;
}

/** Woo allows plain addresses and `*@domain` / `*.domain` wildcards. */
function emailAllowed(restrictions: string[], email: string): boolean {
  if (!restrictions.length) return true;
  const target = email.trim().toLowerCase();
  return restrictions.some((r) => wildcardMatch(r.trim().toLowerCase(), target));
}

/**
 * Woo keeps a coupon usable *on* its expiry date — it compares the expiry
 * against the start of the current day, not the current moment.
 */
function isExpired(dateExpires: string | null): boolean {
  if (!dateExpires) return false;
  const expires = new Date(`${dateExpires}Z`).getTime();
  if (Number.isNaN(expires)) return false;
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  return startOfToday.getTime() > expires;
}

/** Whether this coupon may discount this line. */
function lineEligible(c: WooCoupon, line: CouponLine): boolean {
  const id = line.productId;
  if (c.exclude_sale_items && line.onSale) return false;
  if (id !== null && c.excluded_product_ids.includes(id)) return false;
  if (c.excluded_product_categories.some((cat) => line.categoryIds.includes(cat))) {
    return false;
  }
  if (c.product_ids.length || c.product_categories.length) {
    const byProduct = id !== null && c.product_ids.includes(id);
    const byCategory = c.product_categories.some((cat) =>
      line.categoryIds.includes(cat),
    );
    return byProduct || byCategory;
  }
  return true;
}

/**
 * Validates the coupon against the cart and returns what it takes off.
 * `subtotal` is the whole cart; restrictions decide which lines it applies to.
 */
export function applyCoupon(
  coupon: WooCoupon,
  lines: CouponLine[],
  ctx: { email: string },
): CouponResult {
  if (isExpired(coupon.date_expires)) {
    return { ok: false, reason: "This coupon has expired." };
  }
  if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
    return { ok: false, reason: "This coupon has reached its usage limit." };
  }
  if (!emailAllowed(coupon.email_restrictions, ctx.email)) {
    return {
      ok: false,
      reason: "This coupon is reserved for a different account.",
    };
  }

  const subtotal = money(lines.reduce((a, l) => a + l.price * l.qty, 0));
  const min = num(coupon.minimum_amount);
  const max = num(coupon.maximum_amount);
  if (min > 0 && subtotal < min) {
    return {
      ok: false,
      reason: `This coupon needs a minimum order of $${min.toFixed(2)}.`,
    };
  }
  if (max > 0 && subtotal > max) {
    return {
      ok: false,
      reason: `This coupon only applies to orders up to $${max.toFixed(2)}.`,
    };
  }

  const eligible = lines.filter((l) => lineEligible(coupon, l));
  if (!eligible.length) {
    return {
      ok: false,
      reason: "This coupon doesn't apply to anything in your cart.",
    };
  }

  const amount = num(coupon.amount);
  const cap = coupon.limit_usage_to_x_items;
  let discount = 0;

  if (coupon.discount_type === "percent") {
    /* Woo discounts each line and rounds per line */
    let counted = 0;
    for (const l of eligible) {
      const qty = cap === null ? l.qty : Math.max(0, Math.min(l.qty, cap - counted));
      counted += qty;
      discount += money((l.price * qty * amount) / 100);
    }
  } else if (coupon.discount_type === "fixed_product") {
    let counted = 0;
    for (const l of eligible) {
      const qty = cap === null ? l.qty : Math.max(0, Math.min(l.qty, cap - counted));
      counted += qty;
      /* never take more off a line than the line is worth */
      discount += Math.min(amount, l.price) * qty;
    }
  } else {
    /* fixed_cart is spread across the eligible lines, capped at their value */
    const eligibleTotal = eligible.reduce((a, l) => a + l.price * l.qty, 0);
    discount = Math.min(amount, eligibleTotal);
  }

  discount = money(Math.min(discount, subtotal));
  if (discount <= 0 && !coupon.free_shipping) {
    return { ok: false, reason: "This coupon takes nothing off your cart." };
  }

  return { ok: true, discount, freeShipping: coupon.free_shipping };
}
