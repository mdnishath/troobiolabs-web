"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, User, Menu } from "lucide-react";
import { Logo } from "./Logo";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCart, cartCount } from "@/store/cart";
import { useUi } from "@/store/ui";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { id: "shop", label: "Shop All", href: "/shop" },
  { id: "lab", label: "Lab Reports", href: "/lab-reports" },
  { id: "science", label: "Science", href: "/science" },
  { id: "faq", label: "FAQ", href: "/faq" },
  { id: "contact", label: "Contact", href: "/contact" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const openCart = useUi((s) => s.openCart);
  const count = mounted ? cartCount(items) : 0;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="bg-white">
      {/* Announcement bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-1 bg-ink px-6 py-[9px] text-center text-white">
        <span className="text-[10px] font-semibold uppercase tracking-[1.8px] opacity-[.92]">
          For Laboratory Research Use Only — Not for Human or Veterinary Use
        </span>
        <span className="hidden text-[10px] font-semibold uppercase tracking-[1.8px] text-brand-sky dt:inline">
          Free US Shipping on Orders $150+
        </span>
      </div>
      <div className="h-[3px] bg-gradient-brand" />

      {/* Main bar */}
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-4">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden flex-wrap items-center justify-center gap-6 dt:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.id}
              href={l.href}
              className={cn(
                "pb-[5px] text-xs font-semibold uppercase tracking-[1.2px] no-underline",
                isActive(l.href) ? "text-brand-blue" : "text-slate",
              )}
              style={
                isActive(l.href)
                  ? {
                      backgroundImage:
                        "linear-gradient(90deg,#D9368A,#8D43B8,#1486C9,#F47B2A,#73B84A)",
                      backgroundSize: "100% 3px",
                      backgroundPosition: "bottom left",
                      backgroundRepeat: "no-repeat",
                    }
                  : undefined
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden flex-shrink-0 items-center gap-3 dt:flex">
          <Link
            href="/account"
            title="My Account"
            className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-line text-slate transition-colors hover:border-brand-blue hover:text-brand-blue"
          >
            <User size={17} strokeWidth={2} />
          </Link>
          <button
            onClick={openCart}
            className="inline-flex cursor-pointer items-center gap-[9px] rounded-full border-2 border-brand-blue bg-white px-5 py-[10px] text-xs font-semibold tracking-[1.5px] text-brand-blue transition-colors hover:bg-[#EAF5FC]"
          >
            <ShoppingCart size={16} strokeWidth={2} />
            <span>Cart</span>
            {count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-pink px-[5px] text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-[10px] dt:hidden">
          <button
            onClick={openCart}
            aria-label="Cart"
            className="relative flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-full border-[1.5px] border-line bg-white text-brand-blue"
          >
            <ShoppingCart size={17} strokeWidth={2} />
            {count > 0 && (
              <span className="absolute -right-[5px] -top-[5px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-pink px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[10px] border-[1.5px] border-line bg-white text-ink"
          >
            <Menu size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-line-ghost bg-white pb-2 pt-1 dt:hidden">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.id}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-[#F1F4F7] px-6 py-[14px] text-[13px] font-semibold uppercase tracking-[1.5px] text-steel no-underline"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/account"
            onClick={() => setMenuOpen(false)}
            className="block px-6 py-[14px] text-[13px] font-semibold uppercase tracking-[1.5px] text-brand-blue no-underline"
          >
            My Account
          </Link>
        </nav>
      )}

      <CartDrawer />
    </header>
  );
}
