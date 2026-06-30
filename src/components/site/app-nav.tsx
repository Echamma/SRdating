"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/browse", label: "Browse" },
  { href: "/messages", label: "Messages" },
  { href: "/profile/me", label: "My Profile" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn("nav-link", active && "nav-link-active")}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
