"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TABS = [
  { id: "shipping", label: "Shipping & Delivery" },
  { id: "returns", label: "Returns & Refunds" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms & Conditions" },
  { id: "disclaimer", label: "Research Use Disclaimer" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const P = "mb-0 mt-3 text-[13.5px] leading-[1.9] text-slate";
const H = "text-gradient-brand m-0 text-[22px] font-light tracking-[-.5px]";

const CONTENT: Record<TabId, React.ReactNode> = {
  shipping: (
    <>
      <h2 className={H}>Shipping &amp; Delivery</h2>
      <p className={`${P} mt-4`}>
        <strong>Processing.</strong> Orders placed before 2:00pm ET on business
        days ship the same day from our US facility. Orders after the cutoff,
        or on weekends and holidays, ship the next business day.
      </p>
      <p className={P}>
        <strong>Methods.</strong> Standard tracked shipping (3–5 business days)
        is $8.95, and free on orders of $150 or more. Express cold-chain (1–2
        business days, gel-pack packaging) is $24.95. All shipments include
        tracking and the batch COA documents.
      </p>
      <p className={P}>
        <strong>Coverage.</strong> We currently ship within the United States
        only. Lyophilized peptides are stable at transit temperatures;
        cold-chain is recommended for summer express needs.
      </p>
      <p className={P}>
        <strong>Issues in transit.</strong> Report damaged, lost or incorrect
        shipments within 48 hours of delivery with photos and your order
        number; we replace verified transit damage at no cost.
      </p>
    </>
  ),
  returns: (
    <>
      <h2 className={H}>Returns &amp; Refunds</h2>
      <p className={`${P} mt-4`}>
        <strong>30-day returns.</strong> Unopened vials with intact seals may
        be returned within 30 days of delivery for a full product refund.
        Contact support for a return authorization before shipping anything
        back.
      </p>
      <p className={P}>
        <strong>Quality claims.</strong> If a lot does not match its published
        COA, contact us with the lot number and your analytical data. Verified
        quality issues are replaced or refunded in full — including shipping.
      </p>
      <p className={P}>
        <strong>Non-returnable.</strong> Opened, reconstituted or improperly
        stored vials cannot be returned, given the nature of research
        materials.
      </p>
      <p className={P}>
        <strong>Refund timing.</strong> Approved refunds post to the original
        payment method within 5–7 business days of our receiving the return.
      </p>
    </>
  ),
  privacy: (
    <>
      <h2 className={H}>Privacy Policy</h2>
      <p className={`${P} mt-4`}>
        <strong>What we collect.</strong> Account details (name, email,
        organization), order and shipping information, support correspondence,
        and standard analytics (pages visited, device type).
      </p>
      <p className={P}>
        <strong>How we use it.</strong> To fulfill orders, provide support,
        maintain COA traceability, and — only with your opt-in — send the
        monthly research newsletter. We never sell or rent personal data.
      </p>
      <p className={P}>
        <strong>Payments.</strong> Card details are processed by our
        PCI-compliant payment provider and never touch our servers; we store
        only a payment token and the last four digits.
      </p>
      <p className={P}>
        <strong>Your rights.</strong> Request a copy, correction or deletion of
        your data anytime at privacy@troobiolabs.org. Newsletter emails include
        one-click unsubscribe.
      </p>
    </>
  ),
  terms: (
    <>
      <h2 className={H}>Terms &amp; Conditions</h2>
      <p className={`${P} mt-4`}>
        <strong>Eligibility.</strong> You must be 18 or older and a qualified
        researcher, laboratory or institution to purchase. By ordering you
        represent that you are equipped to handle research chemicals safely.
      </p>
      <p className={P}>
        <strong>Permitted use.</strong> All products are sold strictly for
        laboratory and in-vitro research. Any other use — human, veterinary,
        diagnostic, therapeutic or cosmetic — is prohibited and voids all
        warranties.
      </p>
      <p className={P}>
        <strong>Liability.</strong> To the maximum extent permitted by law,
        TrooBioLabs&apos; liability is limited to the purchase price of the
        products concerned. The purchaser assumes all responsibility for
        storage, handling and use after delivery.
      </p>
      <p className={P}>
        <strong>Changes.</strong> We may update these terms; the version
        published at checkout governs each order. Material changes are
        announced on this page.
      </p>
    </>
  ),
  disclaimer: (
    <>
      <h2 className={H}>Research Use Disclaimer</h2>
      <p className={`${P} mt-4`}>
        All products sold by TrooBioLabs.Org are intended{" "}
        <strong>solely for laboratory and in-vitro research purposes</strong>.
        They are not intended for human or veterinary use, diagnostic or
        therapeutic applications, or any purpose that would classify them as a
        food, drug, cosmetic or medical device.
      </p>
      <p className={P}>
        Statements on this site have not been evaluated by the FDA.
        Descriptions of preclinical research are provided for scientific
        context only and do not imply efficacy or safety in humans.
      </p>
      <p className={P}>
        The purchaser assumes full responsibility for the legal, safe and
        compliant acquisition, storage, handling and use of these compounds,
        including compliance with institutional review and local regulations,
        and agrees to indemnify TrooBioLabs against misuse.
      </p>
      <div className="mt-5 rounded-xl border-[1.5px] border-[#F2C4DA] bg-[#FBE9F2] px-5 py-4 text-xs font-semibold uppercase tracking-[1px] text-[#B02A70]">
        Not for human consumption — research use only
      </div>
    </>
  ),
};

export function PoliciesClient() {
  const [tab, setTab] = useState<TabId>("shipping");

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
        Policies &amp; Legal
      </h1>
      <div className="mb-[30px] mt-4 h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] items-start gap-7">
        <nav className="max-w-[290px] rounded-[14px] border border-[#EAEEF3] bg-surface p-[10px]">
          {TABS.map((t) => {
            const sel = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  window.history.replaceState(null, "", `#${t.id}`);
                }}
                className="block w-full cursor-pointer rounded-[10px] px-4 py-[13px] text-left text-[11.5px] font-semibold uppercase tracking-[1.3px]"
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
        </nav>
        <motion.article
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="col-span-2 min-w-[min(100%,520px)] max-w-[760px]"
        >
          {CONTENT[tab]}
        </motion.article>
      </div>
    </main>
  );
}
