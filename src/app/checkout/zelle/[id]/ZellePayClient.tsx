"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { AuthGate } from "@/components/auth/AuthGate";
import { OrderConfirmed } from "@/components/checkout/OrderConfirmed";
import { ZellePayment } from "@/components/checkout/ZellePayment";
import { Skeleton } from "@/components/ui/Skeleton";
import { fmt } from "@/lib/utils";
import type { ZelleDetails, ZelleProof } from "@/lib/zelle";

interface PayInfo {
  orderId: string;
  total: number;
  currency: string;
  email: string;
  proofSubmitted: boolean;
  cancelled: boolean;
  details: ZelleDetails | null;
}

/** /checkout/zelle/<order> — pay by Zelle and upload proof for a pending order. */
export function ZellePayClient({ id }: { id: string }) {
  const qc = useQueryClient();
  const [done, setDone] = useState(false);

  const info = useQuery({
    queryKey: ["zelle-pay", id],
    queryFn: async () => {
      const res = await fetch(`/api/checkout/zelle/${id}`);
      const data = (await res.json().catch(() => ({}))) as Partial<PayInfo> & {
        error?: string;
      };
      if (res.status === 401) return { unauthenticated: true as const };
      if (!res.ok) throw new Error(data.error ?? "Could not load this order.");
      return data as PayInfo;
    },
    retry: false,
  });

  const submit = useMutation({
    mutationFn: async (proof: ZelleProof) => {
      const res = await fetch(`/api/checkout/zelle/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proof),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Could not submit payment proof.");
      return data;
    },
    onSuccess: () => {
      setDone(true);
      window.scrollTo(0, 0);
    },
  });

  const wrap = (children: React.ReactNode) => (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <h1 className="text-gradient-brand m-0 text-[clamp(28px,4vw,42px)] font-light tracking-[-.5px]">
        Pay with Zelle
      </h1>
      <div className="mt-[14px] flex flex-wrap items-center gap-[10px] text-[10.5px] font-semibold uppercase tracking-[1.5px]">
        <Link href="/cart" className="text-brand-blue no-underline">
          Cart
        </Link>
        <span className="text-[#B6C0CB]">→</span>
        <Link href="/checkout" className="text-brand-blue no-underline">
          Details
        </Link>
        <span className="text-[#B6C0CB]">→</span>
        <span className="text-ink">Payment</span>
        <span className="text-[#B6C0CB]">→</span>
        <span className="text-icon">Confirmation</span>
        <span className="ml-auto inline-flex items-center gap-[6px] text-brand-leaf">
          <Lock size={12} /> Secure
        </span>
      </div>
      <div className="mb-8 mt-[18px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />
      <div className="mx-auto max-w-[720px]">{children}</div>
    </main>
  );

  if (info.isLoading) {
    return wrap(
      <div className="flex flex-col gap-4">
        <Skeleton className="h-[120px] w-full rounded-[14px]" />
        <Skeleton className="h-[320px] w-full rounded-[14px]" />
      </div>,
    );
  }

  if (info.data && "unauthenticated" in info.data) {
    return wrap(
      <div className="flex flex-col items-center gap-4">
        <p className="mb-0 text-center text-[13.5px] leading-[1.7] text-body">
          Sign in to the account that placed this order to complete your Zelle
          payment.
        </p>
        <AuthGate onDone={() => qc.invalidateQueries({ queryKey: ["zelle-pay", id] })} />
      </div>,
    );
  }

  if (info.isError || !info.data) {
    return wrap(
      <div className="rounded-[14px] border border-[#F2C4DA] bg-[#FBE9F2] px-6 py-5 text-[13px] font-semibold text-[#B02A70]">
        {info.error?.message ?? "Could not load this order."}{" "}
        <Link href="/account" className="text-brand-blue">
          Go to My Account
        </Link>
      </div>,
    );
  }

  const data = info.data;

  if (done || data.proofSubmitted) {
    return <OrderConfirmed orderId={data.orderId} email={data.email} zelle />;
  }

  if (data.cancelled) {
    return wrap(
      <div className="rounded-[14px] border border-[#F2C4DA] bg-[#FBE9F2] px-6 py-5 text-[13px] font-semibold text-[#B02A70]">
        This order has been cancelled and can no longer be paid.{" "}
        <Link href="/shop" className="text-brand-blue">
          Back to the shop
        </Link>
      </div>,
    );
  }

  return wrap(
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#EAEEF3] bg-surface px-6 py-4">
        <span className="text-[10px] font-semibold uppercase tracking-[1.8px] text-muted">
          Your order
        </span>
        <span className="rounded-full border-[1.5px] border-[#BFDCEF] px-4 py-[6px] text-[12px] font-semibold tracking-[1.5px] text-brand-blue">
          {data.orderId}
        </span>
      </div>
      <ZellePayment
        amount={fmt(data.total)}
        details={data.details}
        email={data.email}
        busy={submit.isPending}
        error={submit.isError ? submit.error.message : null}
        onSubmit={(proof) => submit.mutate(proof)}
      />
      <p className="mb-0 mt-5 text-center text-[11px] leading-[1.7] text-faint">
        Your order is reserved as <strong>{data.orderId}</strong> and is only
        confirmed once your payment proof is submitted. You can return to this
        page from My Account.
      </p>
    </>,
  );
}
