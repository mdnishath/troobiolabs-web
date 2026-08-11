import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { wpFetch } from "@/lib/api/wp";

interface WooCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  billing: Record<string, string>;
  shipping: Record<string, string>;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    /* logged-out is a normal state — 200 keeps browser consoles clean */
    return NextResponse.json({ user: null });
  }
  /* address book from the WooCommerce customer record */
  const customer = await wpFetch<WooCustomer>(`/wc/v3/customers/${session.uid}`);
  return NextResponse.json({
    id: session.uid,
    email: session.email,
    name: session.name,
    billing: customer.ok ? customer.data.billing : null,
    shipping: customer.ok ? customer.data.shipping : null,
    firstName: customer.ok ? customer.data.first_name : session.name.split(" ")[0],
    lastName: customer.ok ? customer.data.last_name : "",
  });
}
