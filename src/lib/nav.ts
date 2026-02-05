/**
 * Navigation configuration for DowOS
 * Data-driven nav: all mobile + desktop nav items defined here
 * UI components (BottomNav, Sidebar) read from this config
 */

import {
  BarChart3,
  BookOpen,
  Home,
  LogOut,
  Map,
  MessageSquare,
  Settings,
  HelpCircle,
  MoreVertical,
  Shirt,
  Utensils,
  ShoppingBag,
  Heart,
} from "lucide-react";

/**
 * Mobile bottom nav items (5 items max)
 * Displayed on screens < 1024px
 */
export const MOBILE_NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    requiresAuth: true,
    requiresAdmin: false,
    requiresPro: false,
  },
  {
    label: "Education",
    href: "/education",
    icon: BookOpen,
    requiresAuth: true,
    requiresAdmin: false,
    requiresPro: false,
  },
  {
    label: "AI Tutor",
    href: "/ai",
    icon: MessageSquare,
    requiresAuth: true,
    requiresAdmin: false,
    requiresPro: false,
  },
  {
    label: "Campus",
    href: "/campus",
    icon: Map,
    requiresAuth: true,
    requiresAdmin: false,
    requiresPro: false,
  },
  {
    label: "Maps",
    href: "/maps",
    icon: BarChart3, // Placeholder, will be Map icon but using BarChart for now
    requiresAuth: true,
    requiresAdmin: false,
    requiresPro: false,
  },
];

/**
 * Sidebar sections (desktop, > 1024px)
 * Grouped sections with sub-items
 */
export const SIDEBAR_SECTIONS = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: Home,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
    ],
  },
  {
    title: "Study",
    items: [
      {
        label: "Education",
        href: "/education",
        icon: BookOpen,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
      {
        label: "MCQ Solver",
        href: "/education/mcq",
        icon: BookOpen,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
      {
        label: "Viva Bot",
        href: "/education/viva",
        icon: MessageSquare,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: true,
      },
      {
        label: "Progress Matrix",
        href: "/education/progress",
        icon: BarChart3,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
      {
        label: "AI Tutor",
        href: "/ai",
        icon: MessageSquare,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
    ],
  },
  {
    title: "Campus",
    items: [
      {
        label: "Announcements",
        href: "/campus/announcements",
        icon: Heart,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
      {
        label: "Prayer Times",
        href: "/campus/prayers",
        icon: Heart,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
      {
        label: "Lost & Found",
        href: "/campus/lost-found",
        icon: Heart,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
      {
        label: "DowEats",
        href: "/campus/doweats",
        icon: Utensils,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
      {
        label: "Marketplace",
        href: "/campus/marketplace",
        icon: ShoppingBag,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
      {
        label: "Merch",
        href: "/campus/merch",
        icon: Shirt,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
      {
        label: "Maps",
        href: "/maps",
        icon: Map,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
    ],
  },
  {
    title: "Identity",
    items: [
      {
        label: "Profile",
        href: "/profile",
        icon: Home, // Placeholder
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
      {
        label: "Admin",
        href: "/admin",
        icon: Settings,
        requiresAuth: true,
        requiresAdmin: true,
        requiresPro: false,
      },
      {
        label: "Help",
        href: "/help",
        icon: HelpCircle,
        requiresAuth: true,
        requiresAdmin: false,
        requiresPro: false,
      },
    ],
  },
];

/**
 * Bottom sheet menu items (mobile, triggered by avatar tap)
 * Settings, Profile, Help, Logout
 */
export const AVATAR_MENU_ITEMS = [
  {
    label: "Profile",
    href: "/profile",
    icon: Home,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Help",
    href: "/help",
    icon: HelpCircle,
  },
  {
    label: "Logout",
    href: "/auth/logout", // Will be handled specially
    icon: LogOut,
  },
];
