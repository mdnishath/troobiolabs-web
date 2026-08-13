"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { Logo } from "./Logo";
import { CATEGORIES } from "@/lib/categories";

const COL = "min-w-40 flex-1";
const HEAD =
  "mb-4 text-[11px] font-semibold uppercase tracking-[2px] text-ink";
const LINK =
  "block py-[6px] text-[13px] text-body no-underline hover:text-brand-pink";

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="mt-[88px]">
      <div className="h-[3px] bg-gradient-brand" />
      <div className="bg-surface px-6 pb-11 pt-14">
        <div className="mx-auto max-w-[1440px]">
          {/* Newsletter band */}
          <div className="mb-14 flex flex-wrap items-center justify-between gap-[26px] rounded-2xl border border-[#F0E4F1] bg-gradient-wash px-8 py-9">
            <div className="max-w-[520px]">
              <div className="mb-[10px] text-[11px] font-semibold uppercase tracking-[2.5px] text-brand-purple">
                Newsletter
              </div>
              <div className="text-gradient-brand text-[clamp(20px,2.6vw,26px)] font-light tracking-[-.5px]">
                Join the Research List
              </div>
              <p className="mt-[10px] text-sm leading-[1.7] text-body">
                New compounds, batch releases and research summaries. One email
                a month — no spam, unsubscribe anytime.
              </p>
            </div>
            {done ? (
              <div className="flex items-center gap-3 rounded-full border-[1.5px] border-brand-green bg-white px-[26px] py-[14px] text-[13px] font-semibold tracking-[.5px] text-brand-leaf">
                <Check size={16} strokeWidth={3} />
                You&apos;re on the list — welcome.
              </div>
            ) : (
              <div className="flex min-w-[min(100%,340px)] max-w-[440px] flex-1 flex-wrap gap-[10px]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your work email"
                  className="min-w-[200px] flex-1 rounded-full border-[1.5px] border-line bg-white px-5 py-[14px] text-sm text-ink outline-none"
                />
                <button
                  onClick={() => email.includes("@") && setDone(true)}
                  className="cursor-pointer rounded-full bg-gradient-cta px-7 py-[14px] text-xs font-semibold uppercase tracking-[1.5px] text-white"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-11">
            <div className="min-w-60 flex-[1.5]">
              <Logo small />
              <p className="mt-[18px] max-w-[300px] text-[13px] leading-[1.8] text-body">
                Premium research peptides. Proven science. Every batch
                third-party tested and shipped with its batch-specific
                Certificate of Analysis.
              </p>
              <div className="mt-[18px] flex flex-wrap gap-2">
                <span className="rounded-full border-[1.5px] border-[#BFDCEF] px-[11px] py-[5px] text-[9px] font-semibold uppercase tracking-[1.5px] text-brand-blue">
                  Made in USA
                </span>
                <span className="rounded-full border-[1.5px] border-[#DCC8E8] px-[11px] py-[5px] text-[9px] font-semibold uppercase tracking-[1.5px] text-brand-purple">
                  Purity ≥98%
                </span>
                <span className="rounded-full border-[1.5px] border-[#C8E3B4] px-[11px] py-[5px] text-[9px] font-semibold uppercase tracking-[1.5px] text-brand-leaf">
                  3rd-Party Tested
                </span>
              </div>
            </div>
            <div className={COL}>
              <div className={HEAD}>Shop</div>
              <Link href="/shop" className={LINK}>
                Shop All Compounds
              </Link>
              {CATEGORIES.map((c) => (
                <Link key={c.id} href={`/shop?cat=${c.id}`} className={LINK}>
                  {c.name}
                </Link>
              ))}
            </div>
            <div className={COL}>
              <div className={HEAD}>Company</div>
              <Link href="/about" className={LINK}>
                About Us
              </Link>
              <Link href="/science" className={LINK}>
                Science &amp; Research
              </Link>
              <Link href="/lab-reports" className={LINK}>
                Lab Reports
              </Link>
            </div>
            <div className={COL}>
              <div className={HEAD}>Support</div>
              <Link href="/faq" className={LINK}>
                FAQ
              </Link>
              <Link href="/contact" className={LINK}>
                Contact &amp; Live Chat
              </Link>
              <Link href="/contact#ticket" className={LINK}>
                Support Tickets
              </Link>
              <Link href="/policies#shipping" className={LINK}>
                Shipping &amp; Delivery
              </Link>
              <Link href="/policies#returns" className={LINK}>
                Returns &amp; Refunds
              </Link>
              <Link href="/account" className={LINK}>
                My Account
              </Link>
            </div>
            <div className={COL}>
              <div className={HEAD}>Legal</div>
              <Link href="/policies#privacy" className={LINK}>
                Privacy Policy
              </Link>
              <Link href="/policies#terms" className={LINK}>
                Terms &amp; Conditions
              </Link>
              <Link href="/policies#disclaimer" className={LINK}>
                Research Use Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="bg-surface-3 px-6 py-[18px]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-[14px]">
          <span className="text-xs text-muted">
            © 2026 TrooBioLabs.Org — All rights reserved. Designed by{" "}
            <a
              href="https://mdnishath.com/"
              target="_blank"
              rel="noopener"
              className="text-muted underline hover:text-brand-pink"
            >
              Md Nishath
            </a>
          </span>
          <span className="whitespace-nowrap rounded-full border-[1.5px] border-brand-pink px-[14px] py-[6px] text-[9px] font-semibold uppercase tracking-[1.8px] text-brand-pink">
            Research Use Only
          </span>
          <span className="max-w-[520px] text-[11px] leading-[1.6] text-faint">
            All products are intended solely for laboratory and in-vitro
            research and are not for human or veterinary use.
          </span>
        </div>
      </div>
    </footer>
  );
}
