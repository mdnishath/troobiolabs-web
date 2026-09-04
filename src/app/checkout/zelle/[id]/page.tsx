import type { Metadata } from "next";
import { ZellePayClient } from "./ZellePayClient";

export const metadata: Metadata = {
  title: "Pay with Zelle",
  robots: { index: false, follow: false },
};

export default async function ZellePayPage({ params }: PageProps<"/checkout/zelle/[id]">) {
  const { id } = await params;
  return <ZellePayClient id={id} />;
}
