"use client";

/**
 * Sidebar component for desktop (≥ 1024px)
 * Fixed left sidebar with grouped sections
 * Role-gated items (Admin), dark mode support
 *
 * Reference: docs/decisions/mobile-web-ui.md §2, docs/decisions/profile-card-ux.md
 */

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SIDEBAR_SECTIONS } from "@/lib/nav";
import { LogOut, Settings, HelpCircle, Menu } from "lucide-react";

interface SidebarProps {
  userRole?: string;
  isPro?: boolean;
  userName?: string;
  userAvatar?: string;
}

export function Sidebar({ userRole = "student", isPro = false, userName, userAvatar }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  // Filter items based on role and Pro status
  const filteredSections = SIDEBAR_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (item.requiresAdmin && userRole !== "admin") return false;
      if (item.requiresPro && !isPro) return false;
      return true;
    }),
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 w-72 h-screen bg-offwhite dark:bg-dark-mode-bg border-r border-offwhite/20 dark:border-dark-mode-bg/20 z-50">
      {/* Header: Avatar + User Info */}
      <div className="p-4 border-b border-offwhite/20 dark:border-dark-mode-bg/20">
        <div className="relative">
          {/* Avatar Mini-Card */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/80 dark:bg-slate-700/60 backdrop-blur-md border border-white/30 dark:border-white/10">
            {/* Avatar Circle */}
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold border-3 ${
                isPro
                  ? "border-gold dark:border-yellow-400"
                  : "border-navy-200 dark:border-navy-300"
              }`}
            >
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                (userName?.charAt(0) || "S").toUpperCase()
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy-700 dark:text-white truncate">
                {userName || "Student"}
              </p>
              {isPro && (
                <span className="text-xs font-medium text-gold dark:text-yellow-400">
                  ✓ Pro
                </span>
              )}
            </div>

            {/* Avatar Menu Trigger */}
            <button
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              className="p-1 hover:bg-navy-100 dark:hover:bg-navy-700 rounded focus-visible:ring-2 ring-teal-500"
            >
              <Menu size={18} className="text-navy-700 dark:text-white" />
            </button>
          </div>

          {/* Avatar Dropdown Menu */}
          {isAvatarMenuOpen && (
            <div className="absolute top-16 right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-offwhite/20 dark:border-white/10 z-50">
              <button
                onClick={() => {
                  router.push("/profile");
                  setIsAvatarMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-offwhite dark:hover:bg-slate-700 text-sm text-navy-700 dark:text-white flex items-center gap-2"
              >
                👤 Profile
              </button>
              <button
                onClick={() => {
                  router.push("/settings");
                  setIsAvatarMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-offwhite dark:hover:bg-slate-700 text-sm text-navy-700 dark:text-white flex items-center gap-2"
              >
                <Settings size={16} /> Settings
              </button>
              <button
                onClick={() => {
                  router.push("/help");
                  setIsAvatarMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-offwhite dark:hover:bg-slate-700 text-sm text-navy-700 dark:text-white flex items-center gap-2"
              >
                <HelpCircle size={16} /> Help
              </button>
              <hr className="my-1 border-offwhite/20 dark:border-white/10" />
              <button
                onClick={() => {
                  router.push("/auth/logout");
                  setIsAvatarMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {filteredSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 text-xs font-bold text-navy-400 dark:text-navy-300 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <li key={item.href}>
                    <button
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus-visible:ring-2 ring-teal-500 ${
                        isActive
                          ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-l-2 border-teal-500"
                          : "text-navy-600 dark:text-navy-300 hover:bg-navy-100/50 dark:hover:bg-navy-700/50"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: Credits + Upgrade */}
      <div className="p-4 border-t border-offwhite/20 dark:border-dark-mode-bg/20">
        {!isPro && (
          <button
            onClick={() => router.push("/settings")}
            className="w-full px-3 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-md text-sm font-medium hover:shadow-lg transition-shadow"
          >
            Upgrade to Pro
          </button>
        )}
        <p className="text-xs text-navy-400 dark:text-navy-400 mt-2">
          💳 Credits: <span className="font-semibold">PKR 0</span>
        </p>
      </div>
    </aside>
  );
}
