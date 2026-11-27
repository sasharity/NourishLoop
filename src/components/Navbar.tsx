
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const links = [
  { label: "Home", href: "/", icon: "⌂" },
  { label: "Recipes", href: "/recipes", icon: "▤" },
  { label: "Favorites", href: "/favorites", icon: "♡" },
  { label: "Meal Planner", href: "/meal-planner", icon: "▦" },
  { label: "Shopping List", href: "/#shopping-list", icon: "☷" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  const firstName = user?.user_metadata?.first_name as string | undefined;
  const lastName = user?.user_metadata?.last_name as string | undefined;
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : (user?.email?.[0] ?? "U").toUpperCase();

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

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="header-profile" aria-label="User profile">
                <span>{initials}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="nav-link"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Log in
              </Link>
              <Link href="/signup" className="nav-link">
                Sign up
              </Link>
            </>
          )}
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
