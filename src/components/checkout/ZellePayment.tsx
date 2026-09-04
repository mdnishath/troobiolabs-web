"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, ImageUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_PROOF_BYTES, type ZelleDetails, type ZelleProof } from "@/lib/zelle";

const INPUT =
  "w-full rounded-[10px] border-[1.5px] border-line px-[18px] py-[13px] text-[13.5px] text-ink outline-none placeholder:text-icon focus:border-brand-blue";
const LBL = "text-[10px] font-semibold uppercase tracking-[1.8px] text-ghost";

/** Downscale the chosen screenshot to keep the JSON payload small. */
async function fileToDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => resolve(null);
    i.src = raw;
  });
  if (!img) return raw; // browser can't decode it (e.g. HEIC) — send as-is
  const MAX = 1600;
  const scale = Math.min(1, MAX / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function ZellePayment({
  amount,
  details,
  email,
  busy,
  error,
  onBack,
  onSubmit,
}: {
  amount: string;
  details: ZelleDetails | null;
  email: string;
  busy: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: (proof: ZelleProof) => void;
}) {
  const [senderName, setSenderName] = useState("");
  const [reference, setReference] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileErr, setFileErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (f: File | undefined) => {
    setFileErr(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setFileErr("Please upload an image (screenshot or photo) of the transfer.");
      return;
    }
    const url = await fileToDataUrl(f);
    if (url.length > MAX_PROOF_BYTES) {
      setFileErr("That image is too large — please upload a smaller screenshot.");
      return;
    }
    setScreenshot(url);
    setFileName(f.name);
  };

  const copy = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(v);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable — user can select the text */
    }
  };

  const valid = senderName.trim() !== "" && !!screenshot;

  const rows: { label: string; value: string }[] = details
    ? [
        details.name && { label: "Recipient", value: details.name },
        details.email && { label: "Zelle email", value: details.email },
        details.phone && { label: "Zelle phone", value: details.phone },
      ].filter((r): r is { label: string; value: string } => Boolean(r))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[14px] border border-line-soft bg-white p-6 shadow-[0_4px_14px_rgba(21,40,60,.04)]"
    >
      <button
        onClick={onBack}
        className="mb-4 inline-flex cursor-pointer items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[1.5px] text-brand-blue"
      >
        <ArrowLeft size={14} /> Back to details
      </button>

      <div className="text-[13px] font-semibold uppercase tracking-[1.5px]">
        <span className="text-brand-blue">05</span> · Pay with Zelle
      </div>
      <p className="mb-0 mt-2 text-[12.5px] leading-[1.7] text-body">
        Send the exact order total from your bank&apos;s Zelle to the
        recipient below, then upload a screenshot of the completed transfer.
        Your order is confirmed as soon as the proof is submitted; our team
        verifies the transfer before shipping.
      </p>

      {/* amount + recipient */}
      <div className="mt-5 rounded-[14px] border-[1.5px] border-[#BFDCEF] bg-[#EAF5FC] p-5">
        <div className={LBL}>Amount to send</div>
        <div className="mt-1 text-[28px] font-semibold tracking-[-.5px] text-ink">
          {amount}
        </div>

        {rows.length > 0 ? (
          <div className="mt-4 flex flex-col gap-[10px]">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-white px-4 py-3"
              >
                <span>
                  <span className={LBL}>{r.label}</span>
                  <span className="mt-[2px] block text-[13.5px] font-semibold text-ink">
                    {r.value}
                  </span>
                </span>
                <button
                  onClick={() => copy(r.value)}
                  className="inline-flex cursor-pointer items-center gap-[6px] rounded-full border-[1.5px] border-line bg-white px-3 py-[6px] text-[10px] font-semibold uppercase tracking-[1px] text-brand-blue hover:border-brand-blue"
                >
                  {copied === r.value ? <Check size={12} /> : <Copy size={12} />}
                  {copied === r.value ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-0 mt-3 text-[12.5px] text-body">
            Zelle recipient details will be emailed to you with your order
            number.
          </p>
        )}

        {details?.qrUrl && (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-[10px] bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={details.qrUrl}
              alt="Zelle QR code"
              className="h-[160px] w-[160px] object-contain"
            />
            <span className={LBL}>Scan with your banking app</span>
          </div>
        )}

        <p className="mb-0 mt-4 text-[11.5px] leading-[1.7] text-slate">
          Add <strong>{email || "your account email"}</strong> in the Zelle memo
          so we can match the payment to your order.
        </p>
      </div>

      {/* proof form */}
      <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3">
        <input
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="Name on the sending bank account *"
          className={INPUT}
        />
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Zelle confirmation # (optional)"
          className={INPUT}
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className={cn(
          "mt-3 flex w-full cursor-pointer items-center gap-4 rounded-[14px] border-[1.5px] border-dashed px-5 py-[18px] text-left",
          screenshot ? "border-brand-green bg-[#F3FAEE]" : "border-[#C3CFDA] bg-surface",
        )}
      >
        {screenshot ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={screenshot}
            alt="Payment screenshot preview"
            className="h-[56px] w-[56px] flex-shrink-0 rounded-[8px] object-cover"
          />
        ) : (
          <span className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#C9D4DE] text-brand-blue">
            <ImageUp size={19} strokeWidth={1.8} />
          </span>
        )}
        <span>
          <span className="block text-[13px] font-semibold">
            {screenshot ? "Screenshot attached" : "Upload payment screenshot *"}
          </span>
          <span className="mt-[3px] block text-[11.5px] leading-[1.6] text-faint">
            {fileName ??
              "A screenshot of the completed Zelle transfer showing the amount and recipient."}
          </span>
        </span>
      </button>
      {fileErr && (
        <div className="mt-2 text-xs font-semibold text-brand-pink">{fileErr}</div>
      )}

      <button
        onClick={() =>
          valid &&
          screenshot &&
          onSubmit({ senderName: senderName.trim(), reference: reference.trim(), screenshot })
        }
        disabled={!valid || busy}
        className={cn(
          "mt-5 block w-full rounded-full bg-gradient-cta px-[30px] py-4 text-[13px] font-semibold uppercase tracking-[2px] text-white shadow-[0_10px_24px_rgba(20,134,201,.25)]",
          valid && !busy ? "cursor-pointer" : "cursor-not-allowed opacity-45",
        )}
      >
        {busy ? "Submitting…" : "I've Sent the Payment — Place Order"}
      </button>
      {error && (
        <div className="mt-3 text-center text-xs font-semibold text-brand-pink">
          {error}
        </div>
      )}
    </motion.div>
  );
}
