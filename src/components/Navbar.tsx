
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Home", href: "/", icon: "⌂" },
  { label: "Recipes", href: "/recipes", icon: "▤" },
  { label: "Meal Planner", href: "/#meal-planner", icon: "▦" },
  { label: "Shopping List", href: "/#shopping-list", icon: "☷" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand">
          <span className="brand-mark">N</span>
          <span>Nourish Loop</span>
        </Link>

        <nav className="desktop-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href ||
                (link.href === "/recipes" && pathname.startsWith("/recipes"))
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-profile" aria-label="User profile">
          <span>U</span>
        </div>
      </header>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href ||
              (link.href === "/recipes" && pathname.startsWith("/recipes"))
                ? "mobile-nav-link active"
                : "mobile-nav-link"
            }
          >
            <span>{link.icon}</span>
            <small>{link.label}</small>
          </Link>
        ))}
      </nav>
    </>
  );
}
