"use client";

/** My Account — real WordPress-backed auth, orders, addresses and details. */
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/Skeleton";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Orders" },
  { id: "tickets", label: "Support Tickets" },
  { id: "addresses", label: "Addresses" },
  { id: "details", label: "Account Details" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Me {
  id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  billing: Record<string, string> | null;
  shipping: Record<string, string> | null;
}

interface OrderRow {
  id: string;
  date: string;
  items: string;
  total: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#F47B2A",
  processing: "#1486C9",
  "on-hold": "#8D43B8",
  completed: "#73B84A",
  cancelled: "#9AA6B2",
  refunded: "#9AA6B2",
  failed: "#D9368A",
};

const chip = (c: string): React.CSSProperties => ({
  justifySelf: "end",
  fontSize: 9.5,
  fontWeight: 600,
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "#fff",
  background: c,
  borderRadius: 999,
  padding: "7px 15px",
  whiteSpace: "nowrap",
});

const CARD =
  "rounded-[14px] border border-line-soft bg-white p-6 shadow-[0_4px_14px_rgba(21,40,60,.04)]";
const KICKER = "text-[10px] font-semibold uppercase tracking-[1.8px] text-muted";
const INPUT =
  "w-full rounded-[10px] border-[1.5px] border-line px-[18px] py-[13px] text-[13.5px] text-ink outline-none placeholder:text-icon focus:border-brand-blue";
const BTN =
  "cursor-pointer rounded-full bg-gradient-cta px-[30px] py-[13px] text-[11.5px] font-semibold uppercase tracking-[1.8px] text-white disabled:cursor-not-allowed disabled:opacity-45";

/* ------------------------------- auth gate ---------------------------------- */

function AuthGate({ onDone }: { onDone: () => void }) {
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
    <div className="mx-auto w-full max-w-[460px]">
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

        <button onClick={submit} disabled={!valid || busy} className={`${BTN} mt-5 w-full py-[15px]`}>
          {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <p className="mb-0 mt-4 text-center text-[11px] leading-[1.7] text-faint">
          Accounts are for qualified researchers, laboratories and
          institutions. Orders placed while signed in appear in your order
          history.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ account view -------------------------------- */

export function AccountClient() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabId>("dashboard");
  const [saved, setSaved] = useState(false);
  const [news, setNews] = useState(true);

  const me = useQuery<Me | null>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      return data?.id ? (data as Me) : null;
    },
    retry: false,
  });

  const orders = useQuery<{ orders: OrderRow[] }>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/account/orders");
      if (!res.ok) throw new Error("failed");
      return res.json();
    },
    enabled: !!me.data,
  });

  const [details, setDetails] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  /* one-time load of saved details, applied during render when profile arrives */
  const [detailsLoaded, setDetailsLoaded] = useState(false);
  if (me.data && !detailsLoaded) {
    setDetailsLoaded(true);
    setDetails({
      firstName: me.data.firstName ?? "",
      lastName: me.data.lastName ?? "",
      organization: me.data.billing?.company ?? "",
      address: me.data.billing?.address_1 ?? "",
      city: me.data.billing?.city ?? "",
      state: me.data.billing?.state ?? "",
      zip: me.data.billing?.postcode ?? "",
    });
  }

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/account/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      if (!res.ok) throw new Error("failed");
    },
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    qc.invalidateQueries({ queryKey: ["me"] });
  };

  useEffect(() => {
    const applyHash = () => {
      const h = window.location.hash.replace("#", "") as TabId;
      if (TABS.some((t) => t.id === h)) setTab(h);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const dset =
    (k: keyof typeof details) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSaved(false);
      setDetails((d) => ({ ...d, [k]: e.target.value }));
    };

  const latest = orders.data?.orders[0];

  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <h1 className="text-gradient-brand m-0 text-[clamp(28px,4vw,42px)] font-light tracking-[-.5px]">
        My Account
      </h1>
      {me.data && (
        <p className="mb-0 mt-3 text-[14.5px] text-body">
          Welcome back, <strong>{me.data.name}</strong>
          {details.organization ? ` · ${details.organization}` : ""}
        </p>
      )}
      <div className="mb-[30px] mt-4 h-1 w-[150px] rounded-[2px] bg-gradient-brand" />

      {me.isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-[14px]" />
          ))}
        </div>
      ) : !me.data ? (
        <AuthGate onDone={() => qc.invalidateQueries({ queryKey: ["me"] })} />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] items-start gap-7">
          <nav className="max-w-[280px] rounded-[14px] border border-[#EAEEF3] bg-surface p-[10px]">
            {TABS.map((t) => {
              const sel = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setSaved(false);
                    window.history.replaceState(null, "", `#${t.id}`);
                  }}
                  className="block w-full cursor-pointer rounded-[10px] px-4 py-[13px] text-left text-xs font-semibold uppercase tracking-[1.5px]"
                  style={{
                    background: sel ? "#fff" : "none",
                    color: sel ? "#1486C9" : "#3D4753",
                    boxShadow: sel ? "0 4px 14px rgba(21,40,60,.08)" : "none",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
            <button
              onClick={logout}
              className="block w-full cursor-pointer px-4 py-[13px] text-left text-xs font-semibold uppercase tracking-[1.5px] text-faint"
            >
              Log Out
            </button>
          </nav>

          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="col-span-2 min-w-[min(100%,520px)]"
          >
            {tab === "dashboard" && (
              <>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
                  <div className={CARD}>
                    <div className={KICKER}>Latest Order</div>
                    {orders.isLoading ? (
                      <Skeleton className="mt-3 h-16" />
                    ) : latest ? (
                      <>
                        <div className="mt-[10px] text-[15px] font-semibold">{latest.id}</div>
                        <span
                          className="mt-[10px] inline-block rounded-full px-[13px] py-[6px] text-[9.5px] font-semibold uppercase tracking-[1.5px] text-white"
                          style={{ background: STATUS_COLORS[latest.status] ?? "#1486C9" }}
                        >
                          {latest.status}
                        </span>
                        <div className="mt-3 text-xs text-faint">
                          {latest.date} · {latest.total}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mt-[10px] text-[13px] font-semibold text-slate">
                          No orders yet
                        </div>
                        <Link
                          href="/shop"
                          className="mt-3 inline-flex rounded-full border-2 border-brand-blue px-[18px] py-[9px] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue no-underline"
                        >
                          Browse Compounds
                        </Link>
                      </>
                    )}
                  </div>
                  <div className={CARD}>
                    <div className={KICKER}>Support</div>
                    <div className="mt-[10px] text-[13px] font-semibold text-slate">
                      Need help with an order or a COA?
                    </div>
                    <Link
                      href="/contact#ticket"
                      className="mt-3 inline-flex rounded-full border-2 border-brand-blue px-[18px] py-[9px] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue no-underline"
                    >
                      Open a Ticket
                    </Link>
                  </div>
                  <div className={CARD}>
                    <div className={KICKER}>Newsletter</div>
                    <div className="mt-[10px] text-[13px] font-semibold text-slate">
                      {news ? "Subscribed — monthly research digest" : "Not subscribed"}
                    </div>
                    <button
                      onClick={() => setNews((n) => !n)}
                      className="mt-3 cursor-pointer rounded-full border-2 bg-white px-[18px] py-[9px] text-[10.5px] font-semibold uppercase tracking-[1.5px]"
                      style={{
                        borderColor: news ? "#C3CFDA" : "#1486C9",
                        color: news ? "#5A6572" : "#1486C9",
                      }}
                    >
                      {news ? "Unsubscribe" : "Subscribe"}
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-[14px] rounded-[14px] border border-[#EAEEF3] bg-surface px-6 py-5">
                  <span className="whitespace-nowrap rounded-full border-[1.5px] border-brand-pink px-[14px] py-[6px] text-[10px] font-semibold uppercase tracking-[1.8px] text-brand-pink">
                    Research Use Only
                  </span>
                  <span className="min-w-[240px] flex-1 text-xs leading-[1.7] text-body">
                    Your account is registered for laboratory purchasing. COAs
                    for every shipped lot live in{" "}
                    <Link href="/lab-reports">Lab Reports</Link>.
                  </span>
                </div>
              </>
            )}

            {tab === "orders" && (
              <div className="flex flex-col gap-3">
                {orders.isLoading &&
                  Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                {orders.data?.orders.length === 0 && (
                  <div className="rounded-xl border border-line-soft bg-white px-[22px] py-10 text-center text-sm text-faint">
                    No orders yet —{" "}
                    <Link href="/shop">browse the catalog</Link> to place your
                    first research order.
                  </div>
                )}
                {orders.data?.orders.map((o) => (
                  <div
                    key={o.id}
                    className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] items-center gap-[14px] rounded-xl border border-line-soft bg-white px-[22px] py-[18px] shadow-[0_4px_14px_rgba(21,40,60,.04)]"
                  >
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-icon">
                        Order
                      </div>
                      <div className="mt-1 text-sm font-semibold">{o.id}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-icon">
                        Placed
                      </div>
                      <div className="mt-1 text-[13px] font-semibold">{o.date}</div>
                    </div>
                    <div className="min-w-[180px]">
                      <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-icon">
                        Items
                      </div>
                      <div className="mt-1 text-[12.5px] font-semibold text-slate">
                        {o.items}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-icon">
                        Total
                      </div>
                      <div className="mt-1 text-sm font-semibold">{o.total}</div>
                    </div>
                    <span style={chip(STATUS_COLORS[o.status] ?? "#1486C9")}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tab === "tickets" && (
              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-line-soft bg-white px-[22px] py-10 text-center text-sm text-faint">
                  No open tickets. Questions about an order, a lot number or a
                  COA go through the contact form.
                </div>
                <Link
                  href="/contact#ticket"
                  className="mt-2 inline-flex self-start rounded-full bg-gradient-cta px-7 py-[13px] text-[11.5px] font-semibold uppercase tracking-[1.8px] text-white no-underline"
                >
                  Open New Ticket
                </Link>
              </div>
            )}

            {tab === "addresses" && (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-4">
                <div className={CARD}>
                  <div className={KICKER}>Shipping Address</div>
                  {details.address ? (
                    <p className="mb-0 mt-3 text-[13.5px] leading-[1.9] text-slate">
                      {details.organization && (
                        <>
                          {details.organization}
                          <br />
                        </>
                      )}
                      {details.firstName} {details.lastName}
                      <br />
                      {details.address}
                      <br />
                      {details.city}, {details.state} {details.zip}
                    </p>
                  ) : (
                    <p className="mb-0 mt-3 text-[13px] text-faint">
                      No address saved yet — add one below or it will be saved
                      from your first checkout.
                    </p>
                  )}
                  <button
                    onClick={() => setTab("details")}
                    className="mt-[14px] cursor-pointer rounded-full border-2 border-brand-blue bg-white px-5 py-[9px] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue"
                  >
                    Edit
                  </button>
                </div>
                <div className={CARD}>
                  <div className={KICKER}>Billing</div>
                  <p className="mb-0 mt-3 text-[13.5px] leading-[1.9] text-slate">
                    Same as shipping
                    <br />
                    {me.data.email}
                  </p>
                </div>
              </div>
            )}

            {tab === "details" && (
              <div className="max-w-[560px] rounded-[14px] border border-line-soft bg-white p-[26px] shadow-[0_4px_14px_rgba(21,40,60,.04)]">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3">
                  <input placeholder="First name" value={details.firstName} onChange={dset("firstName")} className={INPUT} />
                  <input placeholder="Last name" value={details.lastName} onChange={dset("lastName")} className={INPUT} />
                </div>
                <input value={me.data.email} readOnly className={`${INPUT} mt-3 bg-surface text-muted`} />
                <input placeholder="Organization / lab (optional)" value={details.organization} onChange={dset("organization")} className={`${INPUT} mt-3`} />
                <input placeholder="Street address" value={details.address} onChange={dset("address")} className={`${INPUT} mt-3`} />
                <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,120px),1fr))] gap-3">
                  <input placeholder="City" value={details.city} onChange={dset("city")} className={INPUT} />
                  <input placeholder="State" value={details.state} onChange={dset("state")} className={INPUT} />
                  <input placeholder="ZIP" value={details.zip} onChange={dset("zip")} className={INPUT} />
                </div>
                <div className="mt-[18px] flex items-center gap-[14px]">
                  <button
                    onClick={() => save.mutate()}
                    disabled={save.isPending}
                    className={BTN}
                  >
                    {save.isPending ? "Saving…" : "Save Changes"}
                  </button>
                  {saved && (
                    <span className="text-xs font-semibold text-brand-leaf">
                      Saved ✓
                    </span>
                  )}
                  {save.isError && (
                    <span className="text-xs font-semibold text-brand-pink">
                      Save failed — try again
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </main>
  );
}
