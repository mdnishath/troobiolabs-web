"use client";

import { useState } from "react";

const INPUT =
  "w-full rounded-[10px] border-[1.5px] border-line px-[18px] py-[13px] text-[13.5px] text-ink outline-none placeholder:text-icon focus:border-brand-blue";
const BTN =
  "cursor-pointer rounded-full bg-gradient-cta px-[30px] py-[15px] text-[11.5px] font-semibold uppercase tracking-[1.8px] text-white disabled:cursor-not-allowed disabled:opacity-45";

/** Sign-in / create-account card (WordPress-backed). Calls onDone after auth. */
export function AuthGate({
  onDone,
  note,
}: {
  onDone: () => void;
  note?: string;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid =
    form.email.includes("@") &&
    form.password.length >= (mode === "signup" ? 8 : 1) &&
    (mode === "login" || (form.firstName.trim() && form.lastName.trim()));

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch(
      mode === "login" ? "/api/auth/login" : "/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    onDone();
  };

  return (
    <div className="w-full max-w-[460px]">
      <div className="rounded-2xl border border-line-soft bg-white p-[clamp(24px,3vw,34px)] shadow-[0_8px_24px_rgba(21,40,60,.06)]">
        <div className="flex gap-2 rounded-full border border-[#EAEEF3] bg-surface p-[6px]">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className="flex-1 cursor-pointer rounded-full py-[10px] text-[11px] font-semibold uppercase tracking-[1.5px]"
              style={
                mode === m
                  ? {
                      background: "#fff",
                      color: "#1486C9",
                      boxShadow: "0 4px 14px rgba(21,40,60,.08)",
                    }
                  : { color: "#3D4753" }
              }
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="First name *" value={form.firstName} onChange={set("firstName")} className={INPUT} />
              <input placeholder="Last name *" value={form.lastName} onChange={set("lastName")} className={INPUT} />
            </div>
          )}
          <input
            type="email"
            placeholder="Email address *"
            value={form.email}
            onChange={set("email")}
            className={INPUT}
          />
          <input
            type="password"
            placeholder={mode === "signup" ? "Password (min 8 characters) *" : "Password *"}
            value={form.password}
            onChange={set("password")}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={INPUT}
          />
        </div>

        {error && (
          <div className="mt-3 rounded-[10px] border border-[#F2C4DA] bg-[#FBE9F2] px-4 py-3 text-xs font-semibold text-[#B02A70]">
            {error}
          </div>
        )}

        <button onClick={submit} disabled={!valid || busy} className={`${BTN} mt-5 w-full`}>
          {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <p className="mb-0 mt-4 text-center text-[11px] leading-[1.7] text-faint">
          {note ??
            "Accounts are for qualified researchers, laboratories and institutions. Orders placed while signed in appear in your order history."}
        </p>
      </div>
    </div>
  );
}
