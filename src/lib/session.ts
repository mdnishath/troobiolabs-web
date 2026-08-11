import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/** Signed session cookie for the storefront's customer login. */

export interface Session {
  uid: number;
  email: string;
  name: string;
  exp: number;
}

const COOKIE = "troo_session";
const WEEK = 7 * 24 * 60 * 60;

function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.REVALIDATE_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

const b64u = (buf: Buffer) => buf.toString("base64url");

function sign(payload: string): string {
  return b64u(createHmac("sha256", secret()).update(payload).digest());
}

export function createToken(data: Omit<Session, "exp">): string {
  const payload = b64u(
    Buffer.from(
      JSON.stringify({ ...data, exp: Math.floor(Date.now() / 1000) + WEEK }),
    ),
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE)?.value);
}

export async function setSessionCookie(data: Omit<Session, "exp">) {
  const store = await cookies();
  store.set(COOKIE, createToken(data), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: WEEK,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}
