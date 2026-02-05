"use client";

/**
 * BottomNav component for mobile (< 1024px)
 * Fixed bottom navigation with 5 items
 * Active route highlighted in Teal
 *
 * Reference: docs/decisions/mobile-web-ui.md §2
 */

import { usePathname, useRouter } from "next/navigation";
import { MOBILE_NAV_ITEMS } from "@/lib/nav";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 border-t border-offwhite/20 bg-offwhite dark:bg-dark-mode-bg z-40 safe-area-inset-bottom"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 1rem)" }}
    >
      <div className="flex justify-around items-end h-20">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isActiveTeal = isActive ? "#00A896" : "#A5B8D6";

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center justify-center flex-1 h-20 px-2 gap-1 transition-colors duration-150 hover:bg-offwhite/50 dark:hover:bg-dark-mode-bg/50 active:bg-offwhite/30 dark:active:bg-dark-mode-bg/30 focus-visible:ring-2 ring-teal-500 ring-offset-2"
              title={item.label}
            >
              <Icon
                size={24}
                strokeWidth={1.5}
                color={isActiveTeal}
                className="transition-colors duration-150"
              />
              <span
                className={`text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-teal-500 dark:text-teal-400"
                    : "text-navy-300 dark:text-navy-300"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
