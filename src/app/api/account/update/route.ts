import { NextResponse } from "next/server";
import { getSession, setSessionCookie } from "@/lib/session";
import { wpFetch } from "@/lib/api/wp";

interface Body {
  firstName?: string;
  lastName?: string;
  organization?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const body = (await req.json()) as Body;

  const payload: Record<string, unknown> = {};
  if (body.firstName !== undefined) payload.first_name = body.firstName;
  if (body.lastName !== undefined) payload.last_name = body.lastName;
  if (body.address !== undefined) {
    const addr = {
      first_name: body.firstName ?? "",
      last_name: body.lastName ?? "",
      company: body.organization ?? "",
      address_1: body.address,
      city: body.city ?? "",
      state: body.state ?? "",
      postcode: body.zip ?? "",
      country: "US",
    };
    payload.billing = { ...addr, email: session.email };
    payload.shipping = addr;
  }

  const res = await wpFetch<{ id: number }>(`/wc/v3/customers/${session.uid}`, {
    method: "PUT",
    json: payload,
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Update failed" }, { status: 502 });
  }
  if (body.firstName || body.lastName) {
    await setSessionCookie({
      uid: session.uid,
      email: session.email,
      name: [body.firstName, body.lastName].filter(Boolean).join(" ") || session.name,
    });
  }
  return NextResponse.json({ ok: true });
}
