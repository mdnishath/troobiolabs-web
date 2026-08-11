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
  const { email, password, firstName, lastName } = (await req.json()) as {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  };
  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }
  const res = await wpFetch<WpUser>("/troo/v1/register", {
    method: "POST",
    json: {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    },
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: res.data?.message ?? "Registration failed." },
      { status: res.status },
    );
  }
  const name = [firstName, lastName].filter(Boolean).join(" ");
  await setSessionCookie({ uid: res.data.id, email: res.data.email, name });
  return NextResponse.json({ id: res.data.id, email: res.data.email, name });
}
