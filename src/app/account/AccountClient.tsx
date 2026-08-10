"use client";

/**
 * Account area — demo persona data from the design prototype, to be wired to
 * WooCommerce customer auth when the WordPress backend goes live.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Orders" },
  { id: "tickets", label: "Support Tickets" },
  { id: "addresses", label: "Addresses" },
  { id: "details", label: "Account Details" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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

const ORDERS = [
  { id: "#TROO-26-4187", date: "Aug 02, 2026", items: "Wolverine Blend 10mg ×2 · NAD+ 500mg ×1", total: "$180.00", status: "In Transit", color: "#1486C9" },
  { id: "#TROO-26-3922", date: "Jul 18, 2026", items: "GLP-1 (S) 10mg ×1", total: "$73.95", status: "Delivered", color: "#73B84A" },
  { id: "#TROO-26-3610", date: "Jun 29, 2026", items: "BPC-157 10mg ×3", total: "$135.00", status: "Delivered", color: "#73B84A" },
];

const TICKETS = [
  { subject: "COA request for lot AARLL-3548854-P", meta: "#TB-1042 · Updated Jul 30, 2026", status: "Answered", color: "#1486C9" },
  { subject: "Cold-pack question for reconstituted storage", meta: "#TB-0977 · Closed Jun 14, 2026", status: "Closed", color: "#9AA6B2" },
];

const CARD =
  "rounded-[14px] border border-line-soft bg-white p-6 shadow-[0_4px_14px_rgba(21,40,60,.04)]";
const KICKER =
  "text-[10px] font-semibold uppercase tracking-[1.8px] text-muted";
const INPUT =
  "rounded-[10px] border-[1.5px] border-line px-[18px] py-[13px] text-[13.5px] text-ink outline-none";

export function AccountClient() {
  const [tab, setTab] = useState<TabId>("dashboard");
  const [news, setNews] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const applyHash = () => {
      const h = window.location.hash.replace("#", "") as TabId;
      if (TABS.some((t) => t.id === h)) setTab(h);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <h1 className="text-gradient-brand m-0 text-[clamp(28px,4vw,42px)] font-light tracking-[-.5px]">
        My Account
      </h1>
      <p className="mb-0 mt-3 text-[14.5px] text-body">
        Welcome back, <strong>Dr. J. Reeves</strong> · Meridian Cell Biology Lab
      </p>
      <div className="mb-[30px] mt-4 h-1 w-[150px] rounded-[2px] bg-gradient-brand" />

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
          <Link
            href="/"
            className="block px-4 py-[13px] text-xs font-semibold uppercase tracking-[1.5px] text-faint no-underline"
          >
            Log Out
          </Link>
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
                  <div className="mt-[10px] text-[15px] font-semibold">
                    #TROO-26-4187
                  </div>
                  <span className="mt-[10px] inline-block rounded-full bg-brand-blue px-[13px] py-[6px] text-[9.5px] font-semibold uppercase tracking-[1.5px] text-white">
                    In Transit
                  </span>
                  <div className="mt-3 text-xs text-faint">
                    Arriving Aug 12 · tracked
                  </div>
                </div>
                <div className={CARD}>
                  <div className={KICKER}>Open Tickets</div>
                  <div className="mt-[10px] text-[15px] font-semibold">
                    1 awaiting your reply
                  </div>
                  <button
                    onClick={() => setTab("tickets")}
                    className="mt-3 cursor-pointer rounded-full border-2 border-brand-blue bg-white px-[18px] py-[9px] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue"
                  >
                    View Tickets
                  </button>
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
                  Your account is registered for laboratory purchasing. COAs for
                  every shipped lot live in{" "}
                  <Link href="/lab-reports">Lab Reports</Link>.
                </span>
              </div>
            </>
          )}

          {tab === "orders" && (
            <div className="flex flex-col gap-3">
              {ORDERS.map((o) => (
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
                  <span style={chip(o.color)}>{o.status}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "tickets" && (
            <div className="flex flex-col gap-3">
              {TICKETS.map((k) => (
                <div
                  key={k.subject}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-line-soft bg-white px-[22px] py-[18px] shadow-[0_4px_14px_rgba(21,40,60,.04)]"
                >
                  <div className="min-w-[220px] flex-1">
                    <div className="text-[13.5px] font-semibold">{k.subject}</div>
                    <div className="mt-1 text-[11px] text-faint">{k.meta}</div>
                  </div>
                  <span style={chip(k.color)}>{k.status}</span>
                </div>
              ))}
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
                <p className="mb-0 mt-3 text-[13.5px] leading-[1.9] text-slate">
                  Meridian Cell Biology Lab
                  <br />
                  Attn: Dr. J. Reeves
                  <br />
                  410 Research Parkway, Suite 240
                  <br />
                  Raleigh, NC 27607
                </p>
                <button className="mt-[14px] cursor-pointer rounded-full border-2 border-brand-blue bg-white px-5 py-[9px] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue">
                  Edit
                </button>
              </div>
              <div className={CARD}>
                <div className={KICKER}>Billing Address</div>
                <p className="mb-0 mt-3 text-[13.5px] leading-[1.9] text-slate">
                  Same as shipping
                  <br />
                  VISA •••• 4102
                  <br />
                  Expires 08/28
                </p>
                <button className="mt-[14px] cursor-pointer rounded-full border-2 border-brand-blue bg-white px-5 py-[9px] text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue">
                  Edit
                </button>
              </div>
            </div>
          )}

          {tab === "details" && (
            <div className="max-w-[560px] rounded-[14px] border border-line-soft bg-white p-[26px] shadow-[0_4px_14px_rgba(21,40,60,.04)]">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3">
                <input defaultValue="Dr. Jordan Reeves" className={INPUT} />
                <input defaultValue="j.reeves@meridiancell.org" className={INPUT} />
              </div>
              <input
                defaultValue="Meridian Cell Biology Lab"
                className={`${INPUT} mt-3 w-full`}
              />
              <div className="mt-[18px] flex items-center gap-[14px]">
                <button
                  onClick={() => setSaved(true)}
                  className="cursor-pointer rounded-full bg-gradient-cta px-[30px] py-[13px] text-[11.5px] font-semibold uppercase tracking-[1.8px] text-white"
                >
                  Save Changes
                </button>
                {saved && (
                  <span className="text-xs font-semibold text-brand-leaf">
                    Saved ✓
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
