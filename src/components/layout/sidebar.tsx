"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-links";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center px-5">
        <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          DowOS
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section: notifications, settings, theme toggle */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Bell className="h-5 w-5 shrink-0" />
          <span>Notifications</span>
        </Link>

        <Link
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span>Settings</span>
        </Link>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>

        {/* Profile stub */}
        <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Student</p>
            <p className="text-xs text-muted-foreground truncate">1st Year</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
