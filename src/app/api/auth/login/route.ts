import { NextResponse } from "next/server";
import { wpFetch } from "@/lib/api/wp";
import { setSessionCookie } from "@/lib/session";

interface WpUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  message?: string;
}

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as {
    email?: string;
    password?: string;
  };
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }
  const res = await wpFetch<WpUser>("/troo/v1/login", {
    method: "POST",
    json: { login: email, password },
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: res.data?.message ?? "Invalid email or password." },
      { status: res.status === 401 ? 401 : 400 },
    );
  }
  const name =
    [res.data.first_name, res.data.last_name].filter(Boolean).join(" ") ||
    res.data.email;
  await setSessionCookie({ uid: res.data.id, email: res.data.email, name });
  return NextResponse.json({ id: res.data.id, email: res.data.email, name });
}
