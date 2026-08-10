import type { Metadata } from "next";
import { FaqClient } from "./FaqClient";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Purity, ordering, storage and compliance questions — answered.",
};

export default function FaqPage() {
  return <FaqClient />;
}
