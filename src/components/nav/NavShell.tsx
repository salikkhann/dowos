"use client";

/**
 * NavShell: Responsive wrapper that switches between BottomNav (mobile) and Sidebar (desktop)
 * Responsive breakpoint: Tailwind lg: (1024px)
 *
 * Reference: docs/decisions/mobile-web-ui.md §2
 */

import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";

interface NavShellProps {
  children: ReactNode;
  userRole?: string;
  isPro?: boolean;
  userName?: string;
  userAvatar?: string;
}

export function NavShell({
  children,
  userRole = "student",
  isPro = false,
  userName,
  userAvatar,
}: NavShellProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-offwhite dark:bg-dark-mode-bg">
      {/* Desktop Sidebar */}
      <Sidebar userRole={userRole} isPro={isPro} userName={userName} userAvatar={userAvatar} />

      {/* Main Content Area */}
      <main className="flex-1 w-full lg:ml-72 mb-20 lg:mb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
