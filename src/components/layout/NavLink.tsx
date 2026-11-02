"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Paw } from "@/components/icons/Paw";

export function NavLink({
  href,
  label,
  className,
  onNavigate,
}: {
  href: string;
  label: string;
  className: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      data-active={active}
      className={className}
      onNavigate={onNavigate}
    >
      <span>{label}</span>
      <Paw className="tp-nav-link__paw" />
    </Link>
  );
}
