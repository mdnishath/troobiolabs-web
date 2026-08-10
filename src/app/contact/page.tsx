import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Order questions, COA requests, institutional billing — our support team replies within one business day.",
};

export default function ContactPage() {
  return <ContactClient />;
}
