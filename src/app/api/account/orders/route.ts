import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { wpFetch } from "@/lib/api/wp";

interface WooOrder {
  id: number;
  status: string;
  date_created: string;
  total: string;
  line_items: { name: string; quantity: number }[];
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const res = await wpFetch<WooOrder[]>(
    `/wc/v3/orders?customer=${session.uid}&per_page=20&orderby=date&order=desc`,
  );
  if (!res.ok) {
    return NextResponse.json({ error: "Could not load orders" }, { status: 502 });
  }
  return NextResponse.json({
    orders: res.data.map((o) => ({
      id: `#TROO-${o.id}`,
      date: new Date(o.date_created).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      items: o.line_items
        .map((i) => `${i.name} ×${i.quantity}`)
        .join(" · "),
      total: `$${Number(o.total).toFixed(2)}`,
      status: o.status,
    })),
  });
}
