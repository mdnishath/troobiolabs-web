import type { Metadata } from "next";
import { PoliciesClient } from "./PoliciesClient";

export const metadata: Metadata = {
  title: "Policies & Legal",
  description:
    "Shipping, returns, privacy, terms and the research-use disclaimer.",
};

export default function PoliciesPage() {
  return <PoliciesClient />;
}
