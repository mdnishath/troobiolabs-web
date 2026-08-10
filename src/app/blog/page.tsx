import type { Metadata } from "next";
import { BlogClient } from "./BlogClient";

export const metadata: Metadata = {
  title: "The Research Blog",
  description:
    "Literature reviews, testing explainers and lab protocol notes from the TrooBioLabs research desk.",
};

export default function BlogPage() {
  return <BlogClient />;
}
