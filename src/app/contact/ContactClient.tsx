"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MessageCircle, FileText, Check } from "lucide-react";
import { useHash } from "@/hooks/useHash";

const INPUT =
  "rounded-[10px] border-[1.5px] border-line px-[18px] py-[13px] text-[13.5px] text-ink outline-none placeholder:text-icon focus:border-brand-blue";

const TOPICS = [
  "General inquiry",
  "Order status",
  "COA / lab report request",
  "Support ticket",
  "Wholesale / institutional",
];

interface ChatMsg {
  who: "bot" | "me";
  text: string;
}

export function ContactClient() {
  const hash = useHash();
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "",
    order: "",
    msg: "",
  });
  /* #ticket deep link pre-selects the Support ticket topic until the user picks one */
  const topic =
    form.topic ||
    (hash.includes("ticket") ? "Support ticket" : "General inquiry");
  const [sent, setSent] = useState<{ ref: string; email: string } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      who: "bot",
      text: "Hi! You’re chatting with TROO support. How can we help with your research order today?",
    },
  ]);
  const botTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (botTimer.current) clearTimeout(botTimer.current);
    };
  }, []);

  const valid =
    form.name.trim() !== "" && form.email.includes("@") && form.msg.trim() !== "";

  const send = () => {
    if (!valid) return;
    const isTicket = topic === "Support ticket";
    const ref =
      (isTicket ? "Ticket #TB-" : "Ref #TR-") +
      Math.floor(1000 + Math.random() * 9000);
    setSent({ ref, email: form.email });
  };

  const sendChat = () => {
    const t = draft.trim();
    if (!t) return;
    setMsgs((m) => [...m, { who: "me", text: t }]);
    setDraft("");
    if (botTimer.current) clearTimeout(botTimer.current);
    botTimer.current = setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          who: "bot",
          text: "Thanks — a support specialist will pick this up right away. For lot-specific questions, have your COA lot number handy.",
        },
      ]);
    }, 900);
  };

  const infoCards = [
    {
      icon: Mail,
      color: "#1486C9",
      title: "Email Support",
      body: "support@troobiolabs.org — replies within one business day.",
    },
    {
      icon: MessageCircle,
      color: "#73B84A",
      title: "Live Chat",
      body: "Mon–Fri, 9am–5pm ET. Use the chat bubble in the corner of any page.",
      action: () => setChatOpen(true),
    },
    {
      icon: FileText,
      color: "#8D43B8",
      title: "COA & QC Requests",
      body: 'Need an archived lab report or raw chromatogram? Pick "COA / lab report request" in the form with your lot number.',
    },
  ];

  return (
    <main className="mx-auto max-w-[1440px] px-6 pt-[clamp(30px,4vw,52px)]">
      <h1 className="text-gradient-brand m-0 text-[clamp(30px,4.4vw,48px)] font-light tracking-[-.5px]">
        Contact Us
      </h1>
      <p className="mb-0 mt-[14px] max-w-[620px] text-[15px] leading-[1.8] text-body">
        Order questions, COA requests, institutional billing — our support team
        replies within one business day.
      </p>
      <div className="mb-8 mt-[18px] h-1 w-[150px] rounded-[2px] bg-gradient-brand" />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-7">
        {/* info column */}
        <div className="flex flex-col gap-[14px]">
          {infoCards.map((c) => (
            <div
              key={c.title}
              className="flex items-start gap-4 rounded-[14px] border border-line-soft bg-white px-6 py-[22px] shadow-[0_4px_14px_rgba(21,40,60,.04)]"
            >
              <div
                className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#C9D4DE]"
                style={{ color: c.color }}
              >
                <c.icon size={19} strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-sm font-semibold">{c.title}</div>
                <p className="mb-0 mt-[5px] text-[12.5px] leading-[1.7] text-body">
                  {c.body}
                </p>
                {c.action && (
                  <button
                    onClick={c.action}
                    className="mt-[10px] cursor-pointer rounded-full border-2 border-brand-green bg-white px-[18px] py-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-brand-leaf"
                  >
                    Start Chat
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="rounded-[14px] border border-[#EAEEF3] bg-surface px-6 py-5">
            <div className="text-[10px] font-semibold uppercase tracking-[1.8px] text-muted">
              Support Hours
            </div>
            <div className="flex justify-between gap-[14px] pt-[10px] text-[12.5px]">
              <span className="font-semibold text-muted">Mon – Fri</span>
              <span className="font-semibold">9:00am – 5:00pm ET</span>
            </div>
            <div className="flex justify-between gap-[14px] pt-[6px] text-[12.5px]">
              <span className="font-semibold text-muted">Sat – Sun</span>
              <span className="font-semibold">Email &amp; tickets only</span>
            </div>
          </div>
        </div>

        {/* form column */}
        <div
          id="ticket"
          className="rounded-2xl border border-line-soft bg-white p-[clamp(24px,3vw,32px)] shadow-[0_8px_24px_rgba(21,40,60,.06)]"
        >
          {sent ? (
            <div className="px-[10px] py-[30px] text-center">
              <div
                className="mx-auto flex h-[74px] w-[74px] items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(120deg,#14B8C9,#1486C9 60%,#2E5BD7)",
                }}
              >
                <Check size={32} strokeWidth={2.6} className="text-white" />
              </div>
              <div className="mt-5 text-[19px] font-light tracking-[-.5px]">
                Message Received
              </div>
              <div className="mt-3 inline-block rounded-full border-[1.5px] border-[#BFDCEF] px-[18px] py-2 text-xs font-semibold tracking-[1.5px] text-brand-blue">
                {sent.ref}
              </div>
              <p className="mb-0 mt-4 text-[13px] leading-[1.8] text-body">
                We&apos;ll reply to <strong>{sent.email}</strong> within one
                business day. Track progress under{" "}
                <Link href="/account#tickets">Support Tickets</Link>.
              </p>
            </div>
          ) : (
            <>
              <div className="text-[15px] font-semibold uppercase tracking-[1px]">
                Send a Message
              </div>
              <p className="mb-0 mt-2 text-[12.5px] text-faint">
                Choosing &quot;Support ticket&quot; creates a tracked ticket in{" "}
                <Link href="/account#tickets">My Account</Link>.
              </p>
              <div className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3">
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name *"
                  className={INPUT}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Email *"
                  className={INPUT}
                />
              </div>
              <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3">
                <select
                  value={topic}
                  onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                  className="rounded-[10px] border-[1.5px] border-line bg-white px-4 py-[13px] text-[13.5px] text-ink outline-none"
                >
                  {TOPICS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <input
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                  placeholder="Order # (optional)"
                  className={INPUT}
                />
              </div>
              <textarea
                value={form.msg}
                onChange={(e) => setForm((f) => ({ ...f, msg: e.target.value }))}
                placeholder="How can we help? Include lot numbers for QC questions. *"
                rows={6}
                className="mt-3 w-full resize-y rounded-[10px] border-[1.5px] border-line px-[18px] py-[14px] text-[13.5px] text-ink outline-none placeholder:text-icon focus:border-brand-blue"
              />
              <button
                onClick={send}
                disabled={!valid}
                className={`mt-4 block w-full rounded-full bg-gradient-cta px-[30px] py-[15px] text-[12.5px] font-semibold uppercase tracking-[2px] text-white ${valid ? "cursor-pointer" : "cursor-not-allowed opacity-45"}`}
              >
                Send Message
              </button>
            </>
          )}
        </div>
      </div>

      {/* chat widget */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-24 right-6 z-[400] w-[min(340px,calc(100vw-48px))] overflow-hidden rounded-2xl border border-line-soft bg-white shadow-[0_24px_60px_rgba(21,40,60,.25)]"
          >
            <div
              className="px-[18px] py-4 text-white"
              style={{
                background: "linear-gradient(90deg,#14B8C9,#1486C9 60%,#2E5BD7)",
              }}
            >
              <div className="text-[13px] font-semibold tracking-[.5px]">
                TROO Support
              </div>
              <div className="mt-[3px] text-[10.5px] opacity-85">
                Online · typically replies in minutes
              </div>
            </div>
            <div className="flex max-h-[260px] flex-col gap-[10px] overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className="max-w-[85%] px-[14px] py-[10px] text-[12.5px] leading-[1.6]"
                  style={{
                    alignSelf: m.who === "bot" ? "flex-start" : "flex-end",
                    background: m.who === "bot" ? "#F1F4F7" : "#1486C9",
                    color: m.who === "bot" ? "#1F2933" : "#fff",
                    borderRadius:
                      m.who === "bot"
                        ? "12px 12px 12px 4px"
                        : "12px 12px 4px 12px",
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-[#EEF1F5] p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Type a message…"
                className="min-w-0 flex-1 rounded-full border-[1.5px] border-line px-[15px] py-[11px] text-[12.5px] text-ink outline-none placeholder:text-icon"
              />
              <button
                onClick={sendChat}
                className="cursor-pointer rounded-full bg-brand-blue px-[18px] text-[10.5px] font-semibold uppercase tracking-[1px] text-white"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setChatOpen((o) => !o)}
        title="Live chat"
        className="fixed bottom-[26px] right-6 z-[400] flex h-[58px] w-[58px] cursor-pointer items-center justify-center rounded-full text-white shadow-[0_14px_34px_rgba(20,134,201,.4)]"
        style={{
          background: "linear-gradient(120deg,#14B8C9,#1486C9 60%,#2E5BD7)",
        }}
      >
        <MessageCircle size={24} strokeWidth={2} />
      </button>
    </main>
  );
}
