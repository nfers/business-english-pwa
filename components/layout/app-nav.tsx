"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpenText,
  MessagesSquare,
  Mail,
  Mic,
  Briefcase,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/vocabulary", label: "Vocabulário", icon: BookOpenText },
  { href: "/scenarios", label: "Cenários", icon: MessagesSquare },
  { href: "/email-review", label: "Email", icon: Mail },
  { href: "/speaking", label: "Speaking", icon: Mic },
  { href: "/interview", label: "Entrevista", icon: Briefcase },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar — desktop */}
      <nav className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-[var(--color-border)] md:p-6 md:gap-1">
        <span className="font-display text-lg font-semibold mb-6 px-2">Fluency Desk</span>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-fg)]"
                  : "text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-fg)]",
              ].join(" ")}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Tabbar — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 flex border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                isActive ? "text-[var(--color-accent)]" : "text-[var(--color-fg-muted)]",
              ].join(" ")}
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
